const { fromRpcSig } = require('ethereumjs-util')

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]

module.exports = async ({chainId, account, spender, version, tokenName, tokenAddress, amount, deadline}) => {
  const message = {
    owner: account,
    spender,
    value: amount,
    nonce: 0,
    deadline,
  }
  const domain = {
    name: tokenName,
    version,
    verifyingContract: tokenAddress,
    chainId
  }

  const dataJSON = {
    types: {
      EIP712Domain: EIP712_DOMAIN_TYPE,
      Permit: EIP2612_TYPE,
    },
    domain,
    primaryType: 'Permit',
    message
  }
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      // Planning to use eth_signTypedData_v4 with Metamask
      // (in which case replace dataJSON with JSON.stringify(dataJSON))
      // However eth_signTypedData_v4 not supported here
      method: 'eth_signTypedData',
      params: [account, dataJSON],
      from: account
    }, (err, res) => {
      if (err) {
        return reject(err)
      }
      const signature = fromRpcSig(res.result)
      return resolve(signature)
    })
  })
}
