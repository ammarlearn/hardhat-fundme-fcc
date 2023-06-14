const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    try {
        await run("verify:verify", {
            address: contractAddress,
            args: args,
        })
    } catch (e) {
        if (e.message.toLowerCase.includes("already verifed")) {
            console.log("the contract has already been verified")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
