const { network } = require("hardhat")
const {
    developerChains,
    DECIMALS,
    INITIAL_VALUE,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const { chainId } = network.config.chainId

    if (developerChains.includes(network.name)) {
        log("local network verified, deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_VALUE],
        })
        log("mocks deployed!")
        log("----------------------------------------------------------")
        //marks the end of the deploy script
    }
}
module.exports.tags = ["all", "mocks"]
