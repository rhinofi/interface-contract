const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DVFInterface = artifacts.require('DVFInterface')

module.exports = async function (deployer) {
  if (deployer.network !== 'ropsten') {
    return
  }
  const starkExAddress = '0x69C6392Eb02a2882314134c98DDCBF73B7AdBab1' // dev
  const interfaceInstance = await deployProxy(DVFInterface, [starkExAddress], { deployer })
  console.log('Deployed Interface', interfaceInstance.address)
}
