pragma solidity >=0.6.12 < 0.9.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../StarkEx/IStarkExV2.sol";

contract DVFInterface2 is Initializable {
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
      uint256 quantizedAmount,
      address tokenAddress,
      uint256 quantum
    ) public {
      instance.registerUser(msg.sender, starkKey, signature);
      deposit(starkKey, assetType, vaultId, quantizedAmount, tokenAddress, quantum);
    }

    function registerAndDepositEth(
      uint256 starkKey,
      bytes calldata signature,
      uint256 assetType,
      uint256 vaultId
    ) public payable {
      instance.registerUser(msg.sender, starkKey, signature);
      depositEth(starkKey, assetType, vaultId);
    }

    function deposit(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId,
      uint256 quantizedAmount,
      address tokenAddress,
      uint256 quantum
    ) public {
      IERC20Upgradeable(tokenAddress).transferFrom(msg.sender, address(this), quantizedAmount * quantum);
      instance.deposit(starkKey, assetType, vaultId, quantizedAmount);
    }

    function depositEth(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId
    ) public payable {
      instance.deposit{value: msg.value }(starkKey, assetType, vaultId);
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
}
