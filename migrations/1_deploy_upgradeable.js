const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const MockStarkExV2 = artifacts.require('MockStarkExV2')
const DVFInterface = artifacts.require('DVFInterface')

module.exports = async function (deployer) {
  const mockStarkEx = await deployProxy(MockStarkExV2, [], { deployer })
  const interfaceInstance = await deployProxy(DVFInterface, [mockStarkEx.address], { deployer })
  console.log('Deployed Interface', interfaceInstance.address)
}
