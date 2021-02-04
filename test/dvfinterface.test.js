/* global it, contract, artifacts, assert, web3 */
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades')
const DVFInterface = artifacts.require('./DVFInterface.sol')

const { logGasUsage, blockTime, snapshot, restore, forceMine, moveForwardTime } = require('./helpers/utils')
const catchRevert = require("./helpers/exceptions").catchRevert

const BN = web3.utils.BN
const _1e18 = new BN('1000000000000000000')
const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'


contract('DVFInterface', function (accounts) {
  let token

  beforeEach('redeploy contract', async function () {
    token = await deployProxy(DVFInterface, [accounts[0]])
  })

  it('initialize: initalizes correctly', async function () {

  })

})
