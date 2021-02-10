pragma solidity 0.6.12;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../StarkEx/IStarkExV2.sol";

contract DVFInterface is Initializable {
    IStarkExV2 public instance;

    function initialize(
      address _deployedStarkExProxy
    ) public initializer {
      instance = IStarkExV2(_deployedStarkExProxy);
    }

    function registerAndDeposit(
      uint256 starkKey,
      bytes calldata signature,
      uint256 assetType,
      uint256 vaultId,
      uint256 quantizedAmount
    ) public {
      instance.registerUser(msg.sender, starkKey, signature);
      deposit(starkKey, assetType, vaultId, quantizedAmount);
    }

    function registerAndDepositEth(
      uint256 starkKey,
      bytes calldata signature,
      uint256 assetType,
      uint256 vaultId
    ) public payable {
      instance.registerUser(msg.sender, starkKey, signature);
      depositETH(starkKey, assetType, vaultId);
    }

    function deposit(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId,
      uint256 quantizedAmount
    ) public {
      address tokenContract = getTokenAddress(assetType);
      uint quantum = getQuantum(assetType);
      IERC20Upgradeable(tokenContract).transferFrom(msg.sender, address(this), quantizedAmount * quantum);
      instance.deposit(starkKey, assetType, vaultId, quantizedAmount);
    }

    function depositETH(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId
    ) public payable {
      address(instance).call{value: msg.value }(abi.encode(keccak256("deposit(uint256,uint256,uint256)"), starkKey, assetType, vaultId));
    }

    function approveTokenToDeployedProxy(
      address _token
    ) public {
      IERC20Upgradeable(_token).approve(address(instance), 2 ** 96 - 1);
    }

    function allWithdrawalBalances(
      uint256[] calldata _tokenIds,
      uint256 _whoKey
    ) public view returns (uint256[] memory balances) {
      balances = new uint256[](_tokenIds.length);
      for (uint i = 0; i < _tokenIds.length; i++) {
        balances[i] = instance.getWithdrawalBalance(_whoKey, _tokenIds[i]);
      }
    }

    function getTokenAddress(
      uint256 assetType
    ) internal view returns (address tokenAddress) {
      bytes memory assetInfo = instance.getAssetInfo(assetType);
      tokenAddress = extractContractAddress(assetInfo);
    }

    function getQuantum(
      uint256 assetType
    ) internal view returns (uint256 quantum) {
      quantum = instance.getQuantum(assetType);
    }

    uint256 internal constant TOKEN_CONTRACT_ADDRESS_OFFSET = 0x24;

    function extractContractAddress(
      bytes memory assetInfo
    ) internal pure returns (address _contract) {
      uint256 offset = TOKEN_CONTRACT_ADDRESS_OFFSET;
      uint256 res;
      // solium-disable-next-line security/no-inline-assembly
      assembly {
        res := mload(add(assetInfo, offset))
      }
      _contract = address(res);
    }
}
