import { categorizeCards, analyzeHand, checkOpponentOnes } from '../helpers.js';
export function strategicDiscard(state) {
    // Strategy #3: Use categorized cards - prefer discarding from play cards
    const { playCards, saveCards } = categorizeCards(state.hand, state.opponentHand, state.playArea);
    // Strategy #4: Prioritize discarding 8s if opponent has 1s
    const opponentOnes = checkOpponentOnes(state.opponentHand);
    const uselessEights = state.hand.filter(card => card[1] === 8 && opponentOnes.has(card[0]));
    if (uselessEights.length > 0) {
        // Discard the lowest-ranked useless 8
        return uselessEights.sort((a, b) => a[1] - b[1])[0];
    }
    // SPITEFUL STRATEGY: Discard cards not present in opponent's play area
    const cardsNotPresentInOpponentsPA = [];
    for (let i = 0; i < state.hand.length; i++) {
        // @ts-ignore
        if (!containsSpecies(state.opponentPlayArea, state.hand[i][0])) {
            // @ts-ignore
            cardsNotPresentInOpponentsPA.push(state.hand[i]);
        }
    }
    // If we have cards the opponent can't use, prefer discarding those
    if (cardsNotPresentInOpponentsPA.length > 0) {
        // Filter to only include cards from our preferred discard candidates
        const spitefulCandidates = cardsNotPresentInOpponentsPA.filter(card => {
            const discardCandidates = playCards.length > 0 ? playCards : saveCards;
            // @ts-ignore
            return discardCandidates.some(c => c[0] === card[0] && c[1] === card[1]);
        });
        if (spitefulCandidates.length > 0) {
            // Find the least valuable spiteful card
            const minSpitefulCard = spitefulCandidates.reduce((min, current) => {
                // @ts-ignore
                return current[1] < min[1] ? current : min;
            });
            // @ts-ignore
            return minSpitefulCard;
        }
    }
    // Prefer discarding from play cards over save cards
    const discardCandidates = playCards.length > 0 ? playCards : saveCards;
    // Strategy #2: Analyze hand for scoring potential (enhanced with play area)
    const handAnalysis = analyzeHand(discardCandidates, state.playArea);
    // Find the least valuable card to discard
    let worstCard = discardCandidates[0];
    let worstScore = Infinity;
    for (const card of discardCandidates) {
        const [species, rank] = card;
        const analysis = handAnalysis[species];
        // Calculate card value based on:
        // 1. Rank (higher is better)
        // 2. Whether it's part of a scoring species
        // 3. Special value of 1s and 8s
        // 4. SPITEFUL BONUS: Extra penalty for cards opponent can use
        let cardValue = rank;
        if (analysis) {
            // Bonus for being part of a species we have multiple cards of
            cardValue += analysis.count * 0.5;
            // Bonus for 1s and 8s (unless 8 is useless due to opponent's 1)
            if (rank === 1)
                cardValue += 2;
            if (rank === 8 && !opponentOnes.has(species))
                cardValue += 3;
        }
        // SPITEFUL PENALTY: If opponent has this species in their play area, 
        // it's more valuable to them, so we should keep it
        if (containsSpecies(state.opponentPlayArea, species)) {
            cardValue += 5; // Make it less likely to be discarded
        }
        if (cardValue < worstScore) {
            worstScore = cardValue;
            worstCard = card;
        }
    }
    return worstCard;
}
// Helper function from spiteful strategy
function containsSpecies(playerArea, letter) {
    // Iterate through all the outer keys in data
    for (const outerKey in playerArea) {
        const innerObj = playerArea[outerKey];
        // Iterate through all the inner keys in the nested objects
        for (const innerKey in innerObj) {
            // @ts-ignore
            const [species] = innerObj[innerKey]; // Get the species (letter)
            // Check if the species matches the letter
            if (species === letter) {
                return true; // If letter is found, return true
            }
        }
    }
    return false; // If letter is not found, return false
}
//# sourceMappingURL=strategicDiscard.js.map