export const getNewRank = (prevRank, newRank, playerToIncrementRank) => {
    let rank = newRank > 0 && newRank <= 1000 && newRank || 999
    let incrementedRank = playerToIncrementRank



    if (playerToIncrementRank > prevRank && playerToIncrementRank < 999) {
        incrementedRank = parseInt(playerToIncrementRank) - 1
    }
    if (incrementedRank >= rank && playerToIncrementRank < 999) {
        incrementedRank = parseInt(incrementedRank) + 1
    }


    return incrementedRank
}