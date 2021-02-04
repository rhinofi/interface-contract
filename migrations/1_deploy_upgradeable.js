const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const TetherToken = artifacts.require('TetherToken')

module.exports = async function (deployer) {
  const tetherInstance = await deployProxy(TetherToken, ['Euro Tether', 'EURT', 6], { deployer })
  console.log('Deployed Tether', tetherInstance.address)
