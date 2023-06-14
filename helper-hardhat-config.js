const networkConfig = {
    5: {
        name: "goerli",
        ethUsDPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
    //to use this tho, you have to add all of these networks in the hardhat config file
}
const developerChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_VALUE = 200000000000

module.exports = {
    networkConfig,
    developerChains,
    DECIMALS,
    INITIAL_VALUE,
}
