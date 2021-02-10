/* global it, contract, artifacts, assert, web3 */
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')
const DVFInterface = artifacts.require('./DVFInterface.sol')
const MintableERC20 = artifacts.require('./MintableERC20.sol')
const MockStarkExV2 = artifacts.require('./MockStarkExV2.sol')

const { logGasUsage, blockTime, snapshot, restore, forceMine, moveForwardTime } = require('./helpers/utils')
const catchRevert = require("./helpers/exceptions").catchRevert

const BN = web3.utils.BN
const _1e18 = new BN('1000000000000000000')
const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'


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
      {from: accounts[0]}
    )
    const tokenBalanceStarkEx = await token.balanceOf(mockStark.address)
    assert.equal(tokenBalanceStarkEx.toString(), _1e18.mul(new BN(5)).toString(), 'Balance not deposited')
  })

})
