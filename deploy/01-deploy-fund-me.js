//general format for deploy scripts are:
//import files
//main function
//and then calling the main function
//but this is not how hardhat-deploy works
// heres one way to do it:

//function deployFunc() {
//    console.log("hi!")
//}

//module.exports.default = deployFunc

//but this way is used more often:
//module.exports = async (hre) => {
// const {getNamedAccounts , deployments} = hre
//}
const { network } = require("hardhat")
const { networkConfig, developerChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// const ethUsDPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
//can also be written like this by using sugar semantics:
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const { chainId } = network.config.chainId

    let ethUsDPriceFeedAddress
    if (developerChains.includes(network.name)) {
        const ethUsDAggregator = await get("MockV3Aggregator")
        ethUsDPriceFeedAddress = ethUsDAggregator.address
    } else {
        ethUsDPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsDPriceFeedAddress]

    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(
        "-------------------------------------------------------------------------"
    )
    if (!developerChains.includes(network.name) && etherscan_API_KEY) {
        await verify(FundMe.address, args)
    }
}
module.exports.tags = ["all", "FundMe"]
//what is the concept of mock contracts?
//if the contracts do not exist, we deploy a minimal ver of the contract for our locak testing.
