import { categorizeCards, getAllEmptySpaces, placeCardInPlayArea, scorePlayArea, SPECIES, canBuildRainbowStaircase, getStaircaseTargets, findStaircaseCard, findStaircaseCardHigh, analyzeHand, checkOpponentOnes } from '../helpers.js';
export function strategicPlay(state) {
    // Strategy #1: Build initial mixed structure
    if (state.playArea[0]?.[0] === undefined) {
        // First play - choose a balanced card for mixed structure
        const { playCards } = categorizeCards(state.hand, state.opponentHand, state.playArea);
        // Prefer middle-ranked cards for initial placement
        const sortedCards = playCards.sort((a, b) => Math.abs(a[1] - 4.5) - Math.abs(b[1] - 4.5));
        return { card: sortedCards[0], coord: [0, 0] };
    }
    // NEW: Try rainbow staircase approach first
    const staircaseMove = tryRainbowStaircase(state);
    if (staircaseMove) {
        return staircaseMove;
    }
    // ENHANCED: Dynamic right to score analysis
    const rightToScoreAnalysis = analyzeRightToScoreCompetition(state);
    // Strategy #3: Use categorized cards with enhanced right to score consideration
    const { playCards, saveCards, saveSpecies } = categorizeCards(state.hand, state.opponentHand, state.playArea);
    // ENHANCED: Adjust available cards based on right to score analysis
    const availableCards = getAvailableCardsForPlay(playCards, saveCards, saveSpecies, rightToScoreAnalysis, state);
    const emptySpaces = getAllEmptySpaces(state.playArea);
    if (emptySpaces.length === 0) {
        // Fallback if no empty spaces found
        return { card: state.hand[0], coord: [0, 0] };
    }
    let bestCard = availableCards[0];
    let bestCoord = emptySpaces[0];
    let bestScore = -Infinity;
    // Safety check: ensure we have valid cards and coordinates
    if (availableCards.length === 0) {
        return { card: state.hand[0], coord: emptySpaces[0] };
    }
    // ENHANCED: Strategy #5 with right to score consideration
    for (const card of availableCards) {
        for (const coord of emptySpaces) {
            const newPlayArea = placeCardInPlayArea(state.playArea, card, coord[0], coord[1]);
            // Calculate total score improvement
            let totalScore = 0;
            for (const species of SPECIES) {
                const [score] = scorePlayArea(newPlayArea, species);
                totalScore += score;
            }
            // ENHANCED: Right to score bonus/penalty
            const rightToScoreAdjustment = calculateRightToScoreAdjustment(card, rightToScoreAnalysis, saveSpecies, state);
            // Bonus for not blocking potential single-species paths
            const blockingPenalty = calculateBlockingPenalty(newPlayArea, card, coord);
            const adjustedScore = totalScore + rightToScoreAdjustment - blockingPenalty;
            if (adjustedScore > bestScore) {
                bestScore = adjustedScore;
                bestCard = card;
                bestCoord = coord;
            }
        }
    }
    return { card: bestCard, coord: bestCoord };
}
// ENHANCED: Analyze competition for right to score
function analyzeRightToScoreCompetition(state) {
    const handAnalysis = analyzeHand(state.hand, state.playArea);
    const opponentOnes = checkOpponentOnes(state.opponentHand);
    const analysis = {};
    for (const species of SPECIES) {
        const ourAnalysis = handAnalysis[species];
        const ourScore = ourAnalysis ? ourAnalysis.score : 0;
        // Calculate opponent's potential score for this species
        let opponentScore = 0;
        for (const card of state.opponentHand) {
            if (card && card[0] === species) {
                opponentScore += card[1];
                if (card[1] === 1)
                    opponentScore += 1;
                if (card[1] === 8)
                    opponentScore += 2;
            }
        }
        // Handle 1/8 interaction
        if (opponentOnes.has(species) && ourAnalysis?.has8) {
            // Our 8 is nullified by opponent's 1
            opponentScore += 8; // Opponent gets full value of their 1
        }
        const ourAdvantage = ourScore - opponentScore;
        let competitionLevel = 'low';
        if (Math.abs(ourAdvantage) <= 3) {
            competitionLevel = 'high';
        }
        else if (Math.abs(ourAdvantage) <= 8) {
            competitionLevel = 'medium';
        }
        analysis[species] = {
            ourScore,
            opponentScore,
            competitionLevel,
            ourAdvantage
        };
    }
    return analysis;
}
// ENHANCED: Get available cards considering right to score
function getAvailableCardsForPlay(playCards, saveCards, saveSpecies, rightToScoreAnalysis, state) {
    // If we have play cards, use them
    if (playCards.length > 0) {
        return playCards;
    }
    // ENHANCED: Be more selective about using save cards
    const competitiveSaveCards = saveCards.filter(card => {
        const species = card[0];
        const analysis = rightToScoreAnalysis[species];
        // Don't play save cards if we're in a tight competition for right to score
        if (analysis.competitionLevel === 'high' && analysis.ourAdvantage <= 2) {
            return false;
        }
        // Don't play save cards if opponent has a significant advantage
        if (analysis.ourAdvantage < -5) {
            return false;
        }
        // Don't play save cards if we have very few cards of this species
        const speciesCount = saveCards.filter(c => c[0] === species).length;
        if (speciesCount <= 1) {
            return false;
        }
        return true;
    });
    return competitiveSaveCards.length > 0 ? competitiveSaveCards : saveCards;
}
// ENHANCED: Calculate right to score adjustment for card placement
function calculateRightToScoreAdjustment(card, rightToScoreAnalysis, saveSpecies, state) {
    const [species, rank] = card;
    const analysis = rightToScoreAnalysis[species];
    const isSaveSpecies = saveSpecies.includes(species);
    let adjustment = 0;
    // Bonus for playing cards of species we're likely to win right to score for
    if (analysis.ourAdvantage > 5) {
        adjustment += 3; // Strong advantage - good to build paths
    }
    else if (analysis.ourAdvantage > 0) {
        adjustment += 1; // Slight advantage - still good to build
    }
    // Penalty for playing save cards in tight competition
    if (isSaveSpecies && analysis.competitionLevel === 'high') {
        adjustment -= 5; // Don't waste save cards in tight races
    }
    // Bonus for playing cards of species opponent can't score
    if (analysis.opponentScore === 0) {
        adjustment += 2; // Opponent has no cards of this species
    }
    // Special consideration for 1s and 8s
    if (rank === 1 && analysis.ourAdvantage <= 0) {
        adjustment -= 3; // Don't play 1s if we're not winning the race
    }
    if (rank === 8 && analysis.ourAdvantage <= 0) {
        adjustment -= 3; // Don't play 8s if we're not winning the race
    }
    // Bonus for playing cards that extend existing paths
    const currentPlayAreaScore = scorePlayArea(state.playArea, species)[0];
    if (currentPlayAreaScore > 0) {
        adjustment += 2; // Good to extend existing paths
    }
    return adjustment;
}
// Try to build rainbow staircase (inspired by decent bot)
function tryRainbowStaircase(state) {
    if (!canBuildRainbowStaircase(state.playArea)) {
        return null;
    }
    const { lowTarget, highTarget, lowCoord, highCoord } = getStaircaseTargets(state.playArea);
    // Don't extend too far beyond 1-8 range
    if (lowTarget < 1 && highTarget > 8) {
        return null;
    }
    const { playCards, saveCards } = categorizeCards(state.hand, state.opponentHand, state.playArea);
    const availableCards = playCards.length > 0 ? playCards : saveCards;
    if (availableCards.length === 0) {
        return null;
    }
    // Try to extend the low end
    if (lowTarget >= 1 && lowCoord) {
        // Check if the target coordinate is actually empty
        if (state.playArea[lowCoord[0]]?.[lowCoord[1]] === undefined) {
            const lowCard = findStaircaseCard(availableCards, lowTarget);
            if (lowCard && lowTarget - lowCard[1] <= 2) {
                return { card: lowCard, coord: lowCoord };
            }
        }
    }
    // Try to extend the high end
    if (highTarget <= 8 && highCoord) {
        // Check if the target coordinate is actually empty
        if (state.playArea[highCoord[0]]?.[highCoord[1]] === undefined) {
            const highCard = findStaircaseCardHigh(availableCards, highTarget);
            if (highCard && highCard[1] - highTarget <= 2) {
                return { card: highCard, coord: highCoord };
            }
        }
    }
    return null;
}
// Calculate penalty for blocking potential single-species paths
function calculateBlockingPenalty(playArea, placedCard, coord) {
    let penalty = 0;
    const [x, y] = coord;
    const cardSpecies = placedCard[0];
    // Check adjacent cards to see if we're blocking a potential single-species path
    const adjacentCoords = [
        [x, y + 1], [x, y - 1], [x + 1, y], [x - 1, y]
    ];
    for (const [adjX, adjY] of adjacentCoords) {
        const adjacentCard = playArea[adjX]?.[adjY];
        if (adjacentCard && adjacentCard[0] === cardSpecies) {
            // We're adjacent to same species - this is good, reduce penalty
            penalty -= 2;
        }
        else if (adjacentCard && adjacentCard[0] !== cardSpecies) {
            // We're adjacent to different species - this might block a path
            penalty += 1;
        }
    }
    return penalty;
}
//# sourceMappingURL=strategicPlay.js.map