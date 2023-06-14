require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("hardhat-gas-reporter")

const GANACHE_URL = process.env.GANACHE_URLAMMAR
const RINKEBY_URL = process.env.RINKEBYURL
const COINMARKET_APIKEY = process.env.COINMARKET_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    networks: {
        ganache: {
            url: GANACHE_URL,
            accounts: [],
        },
        rinkeby: {
            url: RINKEBY_URL,
            accounts: [],
            chainId: 4,
            blockConfirmations: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        users: {
            default: 1,
        },
    },
    defaultNetwork: "hardhat",
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        //coinmarketcap: COINMARKET_APIKEY,
    },
}
