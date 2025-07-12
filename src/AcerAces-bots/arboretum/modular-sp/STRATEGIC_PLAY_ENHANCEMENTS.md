# Strategic Play Enhancements - Right to Score Consideration

## Overview

The enhanced `strategicPlay` strategy now includes sophisticated analysis of the "right to score" mechanism, which is crucial for winning Arboretum games. The bot now dynamically adjusts its play strategy based on competition for each species.

## Key Enhancements

### 1. **Dynamic Right to Score Analysis** (`analyzeRightToScoreCompetition`)

**Purpose**: Analyzes competition for each species to determine our advantage/disadvantage.

**Features**:
- Calculates our potential score vs opponent's potential score for each species
- Handles the 1/8 interaction (opponent's 1 nullifies our 8)
- Categorizes competition as 'high', 'medium', or 'low' based on score difference
- Tracks our advantage for each species

**Example**:
```typescript
// If we have [J3, J7, J8] and opponent has [J1, J4]
// Our score: 3+7+8+2 = 20, Opponent score: 1+4+1 = 6
// Our advantage: 14, Competition level: 'low'
```

### 2. **Smart Save Card Management** (`getAvailableCardsForPlay`)

**Purpose**: More selectively uses save cards based on competition analysis.

**Rules**:
- **Never play save cards** in tight competition (advantage ≤ 2)
- **Never play save cards** if opponent has significant advantage (advantage < -5)
- **Never play save cards** if we have ≤ 1 card of that species
- **Prefer play cards** when available

**Benefits**:
- Preserves competitive hands for endgame
- Avoids wasting valuable save cards in losing battles
- Maintains flexibility for future draws

### 3. **Right to Score Adjustment** (`calculateRightToScoreAdjustment`)

**Purpose**: Applies bonuses/penalties to card placement based on right to score analysis.

**Bonuses**:
- **+3 points** for playing cards of species we're strongly winning (advantage > 5)
- **+1 point** for playing cards of species we're slightly winning (advantage > 0)
- **+2 points** for playing cards of species opponent can't score (opponent score = 0)
- **+2 points** for extending existing paths

**Penalties**:
- **-5 points** for playing save cards in tight competition
- **-3 points** for playing 1s when not winning the race
- **-3 points** for playing 8s when not winning the race

### 4. **Enhanced Decision Making**

The strategy now considers multiple factors when choosing which card to play:

1. **Immediate path building** (existing logic)
2. **Right to score competition** (new)
3. **Save card preservation** (enhanced)
4. **Opponent analysis** (new)
5. **Path blocking prevention** (existing)

## Strategic Impact

### Early Game
- More conservative with save cards
- Focuses on building mixed structures
- Analyzes opponent's known cards for future planning

### Mid Game
- Dynamically adjusts strategy based on competition
- Preserves competitive hands while building paths
- Balances immediate scoring vs endgame preparation

### Late Game
- Maximizes right to score potential
- Ensures competitive hands for final scoring
- Prioritizes species we're likely to win

## Example Scenarios

### Scenario 1: Tight Competition
```
Our hand: [J3, J7, R1, R8, C4]
Opponent hand: [J1, J6, R2, R7, C3]
Analysis: High competition for J and R, low for C
Action: Play C4, save J and R cards
```

### Scenario 2: Clear Advantage
```
Our hand: [J3, J7, J8, R1, C4]
Opponent hand: [J2, R3, M5]
Analysis: Strong advantage for J, medium for R, opponent has no C
Action: Play J cards to build paths, save R1 for endgame
```

### Scenario 3: Opponent Advantage
```
Our hand: [J3, J4, R1, C4]
Opponent hand: [J1, J7, J8, R2, R8]
Analysis: Opponent winning J and R races
Action: Play C4, save J and R cards for potential future draws
```

## Benefits

1. **Better Endgame Preparation**: Ensures competitive hands for final scoring
2. **Smarter Resource Management**: Avoids wasting valuable cards in losing battles
3. **Dynamic Adaptation**: Responds to opponent's strategy and known cards
4. **Balanced Approach**: Maintains path building while preserving scoring potential
5. **Competitive Advantage**: Outperforms bots that don't consider right to score

## Configuration

The strategy can be fine-tuned by adjusting the thresholds in:
- `analyzeRightToScoreCompetition`: Competition level thresholds
- `getAvailableCardsForPlay`: Save card usage rules
- `calculateRightToScoreAdjustment`: Bonus/penalty values

These can be made configurable through the modular strategy system for different play styles. 