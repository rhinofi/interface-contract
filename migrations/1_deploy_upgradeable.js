const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const DVFInterface = artifacts.require('DVFInterface2')

module.exports = async function (deployer, a, b ,c) {
  // if (deployer.network !== 'ropsten') {
  //   return
  // }
  const { customConfig } = deployer.networks[deployer.network]
  const { starkExAddress } = customConfig

  if (!starkExAddress) { 
    throw new Error('StarkEx address not defined for this network')
  }

  const interfaceInstance = await deployProxy(DVFInterface, [starkExAddress], { deployer })
  console.log('Deployed Interface', interfaceInstance.address)
}
