const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const MockStarkExV2 = artifacts.require('MockStarkExV2')
const DVFInterface = artifacts.require('DVFInterface')
const MintableERC20 = artifacts.require('./MintableERC20.sol')

module.exports = async function (deployer) {
  const token = await MintableERC20.new('TestToken', 'TEST')
  const mockStarkEx = await MockStarkExV2.new(token.address)
  const interfaceInstance = await deployProxy(DVFInterface, [mockStarkEx.address], { deployer })
  console.log('Deployed Interface', interfaceInstance.address)
}
