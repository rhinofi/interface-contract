/* global it, contract, artifacts, assert, web3 */
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')
const DVFInterface = artifacts.require('./DVFInterface2.sol')
const MintableERC20 = artifacts.require('./MintableERC20.sol')
const MockStarkExV2 = artifacts.require('./MockStarkExV2.sol')


const { logGasUsage, blockTime, snapshot, restore, forceMine, moveForwardTime } = require('./helpers/utils')
const catchRevert = require("./helpers/exceptions").catchRevert
const signPermit = require('./helpers/signPermit')

const BN = web3.utils.BN
const _1e18 = new BN('1000000000000000000')
const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'
const quantum = 10 ** 8


contract('DVFInterface', function (accounts) {
  let interface, mockStark, token

  beforeEach('redeploy contract', async function () {
    token = await MintableERC20.new('TestToken', 'TEST')
    mockStark = await MockStarkExV2.new(token.address)
    interface = await deployProxy(DVFInterface, [mockStark.address])
    token.mint(accounts[0], _1e18.mul(new BN(5000)))
  })

  it('initialize: initalizes correctly', async function () {
    const registeredStarkExAddress = await interface.instance()
    assert.equal(mockStark.address, registeredStarkExAddress, 'Incorrectly initialized')

    const assetInfo = await mockStark.getAssetInfo(123)
    assert.equal(`0xf47261b0000000000000000000000000${token.address.toLowerCase().substr(2)}`, assetInfo)
  })

  it('registerAndMakeDepositEth: transfers ETH to StarkEx', async function () {
    await interface.registerAndDepositEth(
      1234,
      '0x12',
      2345,
      67890123,
      {from: accounts[0], value: _1e18}
    )
    const ethBalanceStarkEx = await web3.eth.getBalance(mockStark.address)
    assert.equal(ethBalanceStarkEx.toString(), _1e18.toString(), 'Balance not deposited')
  })

  it('registerAndMakeDeposit: reverts if user has not pre-approved interface', async function () {
    await catchRevert(interface.registerAndDeposit(
      1234,
      '0x12',
      2345,
      67890123,
      5000000,
      token.address,
      quantum,
      {from: accounts[0], value: _1e18}
    ))
  })

  it('registerAndMakeDeposit: transfers token to StarkEx if approvals are done', async function () {
    await token.approve(interface.address, maxUint256)
    await interface.approveTokenToDeployedProxy(token.address)
    await interface.registerAndDeposit(
      1234,
      '0x12',
      2345,
      67890123,
      50000000000,
      token.address,
      quantum,
      {from: accounts[0]}
    )
    const tokenBalanceStarkEx = await token.balanceOf(mockStark.address)
    assert.equal(tokenBalanceStarkEx.toString(), _1e18.mul(new BN(5)).toString(), 'Balance not deposited')
  })

  it('registerAndMakeDeposit: transfers token to StarkEx if exact amount approved with permit', async function () {
    const currentBlock = await web3.eth.getBlock("latest")
    const chainId = await web3.eth.getChainId()
    const quantizedAmount = 5000000
    const amount = new BN(quantum).mul(new BN(quantizedAmount))
    const deadline = currentBlock.timestamp + 1000
    const {v, r, s} = await signPermit({
      account: accounts[0],
      spender: interface.address,
      tokenName: 'TestToken',
      tokenAddress: token.address,
      amount: amount.toString(),
      deadline,
      chainId,
      // Default Openzeppelin constructor for ERC20Permit sets version to '1' for token
      version: '1'
    })
    await interface.approveTokenToDeployedProxy(token.address)
    await interface.registerAndDepositWithPermit(
      1234,
      '0x12',
      2345,
      67890123,
      quantizedAmount,
      token.address,
      quantum,
      amount.toString(), deadline, v, r, s,
      {from: accounts[0]}
    )
    const tokenBalanceStarkEx = await token.balanceOf(mockStark.address)
    assert.equal(tokenBalanceStarkEx.toString(), amount.toString(), 'Balance not deposited')
  })

  it('registerAndMakeDeposit: transfers token to StarkEx if MAX amount approved with permit', async function () {
    const currentBlock = await web3.eth.getBlock("latest")
    const chainId = await web3.eth.getChainId()
    const quantizedAmount = 5000000
    const amount = new BN(quantum).mul(new BN(quantizedAmount))
    const deadline = currentBlock.timestamp + 1000
    const {v, r, s} = await signPermit({
      account: accounts[0],
      spender: interface.address,
      tokenName: 'TestToken',
      tokenAddress: token.address,
      amount: maxUint256,
      deadline,
      chainId,
      // Default Openzeppelin constructor for ERC20Permit sets version to '1' for token
      version: '1'
    })
    await interface.approveTokenToDeployedProxy(token.address)
    await interface.registerAndDepositWithPermit(
      1234,
      '0x12',
      2345,
      67890123,
      quantizedAmount,
      token.address,
      quantum,
      maxUint256, deadline, v, r, s,
      {from: accounts[0]}
    )
    // Since max amount has been approved using permit, further deposits should work
    await interface.deposit(
      1234,
      2345,
      67890123,
      quantizedAmount,
      token.address,
      quantum,
      {from: accounts[0]}
    )
    const tokenBalanceStarkEx = await token.balanceOf(mockStark.address)
    assert.equal(tokenBalanceStarkEx.toString(), amount.mul(new BN(2)).toString(), 'Balance not deposited')
  })

  it('registerAndMakeDeposit: reverts if user has not pre-approved interface', async function () {
    await catchRevert(interface.registerAndDeposit(
      1234,
      '0x12',
      2345,
      67890123,
      5000000,
      token.address,
      quantum,
      {from: accounts[0], value: _1e18}
    ))
  })
})

contract('DVFInterface Failing', function (accounts) {
  // Revert actions to test failing scenarios
  const FailingDVFInterface = artifacts.require('./DVFInterface2.sol')
  const FailingMintableERC20 = artifacts.require('./FailingMintableERC20.sol')
  const FailingMockStarkExV2 = artifacts.require('./FailingMockStarkExV2.sol')
  let interface, mockStark, token

  beforeEach('redeploy contract', async function () {
    token = await FailingMintableERC20.new('TestToken', 'TEST')
    mockStark = await FailingMockStarkExV2.new(token.address)
    interface = await deployProxy(FailingDVFInterface, [mockStark.address])
    token.mint(accounts[0], _1e18.mul(new BN(5000)))
  })

  it('registerAndMakeDepositEth: reverts entire transaction internal contract calls fail', async function () {
    await catchRevert(interface.registerAndDepositEth(
      1234,
      '0x12',
      2345,
      67890123,
      { from: accounts[0], value: _1e18 }
    ))

    const ethBalanceStarkEx = await web3.eth.getBalance(mockStark.address)
    const ethBalanceInterface = await web3.eth.getBalance(interface.address)
    assert.equal(ethBalanceStarkEx.toString(), '0', 'Eth stuck in StarkEx')
    assert.equal(ethBalanceInterface.toString(), '0', 'Eth stuck in proxy contract')
  })

  it('registerAndMakeDeposit: reverts entire transaction if permit signature is invalid', async function () {
    const currentBlock = await web3.eth.getBlock("latest")
    const chainId = await web3.eth.getChainId()
    const quantizedAmount = 5000000
    const amount = new BN(quantum).mul(new BN(quantizedAmount))
    const deadline = currentBlock.timestamp + 1000
    const {v, r, s} = await signPermit({
      account: accounts[0],
      spender: interface.address,
      tokenName: 'TestTokenInvalid', // Invalid token name is one way to make sig invalid
      tokenAddress: token.address,
      amount: amount.toString(),
      deadline,
      chainId,
      // Default Openzeppelin constructor for ERC20Permit sets version to '1' for token
      version: '1'
    })
    await interface.approveTokenToDeployedProxy(token.address)
    await catchRevert(interface.registerAndDepositWithPermit(
      1234,
      '0x12',
      2345,
      67890123,
      quantizedAmount,
      token.address,
      quantum,
      amount.toString(), deadline, v, r, s,
      {from: accounts[0]}
    ))
    const tokenBalanceStarkEx = await token.balanceOf(mockStark.address)
    assert.equal(tokenBalanceStarkEx.toString(), 0, 'Balance wrongly deposited - should have failed because of wrong signature')
  })

  it('registerAndMakeDeposit: reverts entire transaction if permit signature is expired', async function () {
    const currentBlock = await web3.eth.getBlock("latest")
    const chainId = await web3.eth.getChainId()
    const quantizedAmount = 5000000
    const amount = new BN(quantum).mul(new BN(quantizedAmount))
    const deadline = currentBlock.timestamp + 1000
    const {v, r, s} = await signPermit({
      account: accounts[0],
      spender: interface.address,
      tokenName: 'TestToken',
      tokenAddress: token.address,
      amount: amount.toString(),
      deadline,
      chainId,
      // Default Openzeppelin constructor for ERC20Permit sets version to '1' for token
      version: '1'
    })
    await moveForwardTime(1001)
    await interface.approveTokenToDeployedProxy(token.address)
    await catchRevert(interface.registerAndDepositWithPermit(
      1234,
      '0x12',
      2345,
      67890123,
      quantizedAmount,
      token.address,
      quantum,
      amount.toString(), deadline, v, r, s,
      {from: accounts[0]}
    ))
    const tokenBalanceStarkEx = await token.balanceOf(mockStark.address)
    assert.equal(tokenBalanceStarkEx.toString(), 0, 'Balance wrongly deposited - should have failed because of expiration')
  })

  it('registerAndMakeDeposit: reverts entire transaction if permit amount is below transfered amount', async function () {
    const currentBlock = await web3.eth.getBlock("latest")
    const chainId = await web3.eth.getChainId()
    const quantizedAmount = 5000000
    const amount = new BN(quantum).mul(new BN(quantizedAmount))
    const deadline = currentBlock.timestamp + 1000
    const {v, r, s} = await signPermit({
      account: accounts[0],
      spender: interface.address,
      tokenName: 'TestToken',
      tokenAddress: token.address,
      amount: amount.div(new BN(2)).toString(),
      deadline,
      chainId,
      // Default Openzeppelin constructor for ERC20Permit sets version to '1' for token
      version: '1'
    })
    await interface.approveTokenToDeployedProxy(token.address)
    await catchRevert(interface.registerAndDepositWithPermit(
      1234,
      '0x12',
      2345,
      67890123,
      quantizedAmount,
      token.address,
      quantum,
      amount.toString(), deadline, v, r, s,
      {from: accounts[0]}
    ))
    const tokenBalanceStarkEx = await token.balanceOf(mockStark.address)
    assert.equal(tokenBalanceStarkEx.toString(), 0, 'Balance wrongly deposited - should have failed because of permitted amount being less than transfered')
  })
})
