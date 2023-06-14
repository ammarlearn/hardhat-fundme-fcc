const { getNamedAccounts, ethers, network } = require("hardhat")
const { assert } = require("chai")
const { developerChains } = require("../../helper-hardhat-config")
developerChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              fundMe = await getContract("FundMe", deployer)
              deployer = await getNamedAccounts()
          })
          it("lets allows to withdraw and to fund", async function () {
              await fundMe.fund({ value: { sendValue } })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
