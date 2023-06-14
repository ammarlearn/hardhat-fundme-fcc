const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developerChains } = require("../../helper-hardhat-config")
!developerChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          let mockV3aggregator
          const valueToBeSent = ethers.utils.parseEther("1")
          beforeEach(async function () {
              //deploy our fundME contract
              //use hardhat deploy for the deployment
              //describe functions should not be async, they should be normal

              await deployments.fixture(["all"])
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3aggregator.address)
              })
          })
          describe("fund", function () {
              it("fails to execute if the amount provided is too less", async function () {
                  expect(fundMe.fund()).to.be.reverted
              })
              it("properly updates the data structure related to fund", async function () {
                  await fundMe.fund({ value: valueToBeSent })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), valueToBeSent.toString())
              })
              it("should add the homie that gave money to array", async function () {
                  await fundMe.fund({ value: valueToBeSent })
                  const response = await fundMe.getFunders(0)
                  assert.equal(response, deployer)
              })
          })
          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: valueToBeSent })
              })
              it("should properly withdraw from the withdraw function", async function () {
                  //arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { effectiveGasPrice, gasUsed } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("should withdraw money correctly from multiple accounts ", async function () {
                  //arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const connectedAccount = await fundMe.connect(accounts[0])
                      await connectedAccount.fund({ value: valueToBeSent })
                  }
                  //act
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } =
                      await transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  //have to use await for expect keyword.
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("only allows the owner to withdraw funds", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnected = await fundMe.connect(attacker)
                  await expect(
                      attackerConnected.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })

          it("cheaperWithdraw multiple accounts.. ", async function () {
              //arrange
              const accounts = await ethers.getSigners()
              for (let i = 1; i < 6; i++) {
                  const connectedAccount = await fundMe.connect(accounts[0])
                  await connectedAccount.fund({ value: valueToBeSent })
              }
              //act
              const startingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const startingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )

              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { gasUsed, effectiveGasPrice } = await transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )

              //assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                  startingDeployerBalance.add(startingFundMeBalance).toString(),
                  endingDeployerBalance.add(gasCost).toString()
              )
              //have to use await for expect keyword.
              await expect(fundMe.getFunders(0)).to.be.reverted

              for (i = 1; i < 6; i++) {
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(
                          accounts[i].address
                      ),
                      0
                  )
              }
          })
          it("cheaperWithdraw normal withdraw test", async function () {
              //arrange
              const startingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const startingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )

              //act
              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait(1)
              const { effectiveGasPrice, gasUsed } = transactionReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )

              //assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                  startingFundMeBalance.add(startingDeployerBalance).toString(),
                  endingDeployerBalance.add(gasCost).toString()
              )
          })
          it("gives back the name of the owner of the contract correctly", async function () {
              const nameWeHave = await fundMe.getOwner()
              assert.equal(nameWeHave, deployer)
          })
      })
