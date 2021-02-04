pragma solidity 0.6.12;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../StarkEx/IStarkExV2.sol";

contract DVFInterface is Initializable {
    IStarkExV2 deployedContractProxy;

    function initialize(
      address _deployedContractProxy
    ) public initializer {
      deployedContractProxy = IStarkExV2(_deployedContractProxy);
    }
    function registerAndDeposit(
      uint256 starkKey,
      bytes calldata signature,
      uint256 assetType,
      uint256 vaultId,
      uint256 quantizedAmount,
      address tokenContract
    ) public {
      deployedContractProxy.registerUser(msg.sender, starkKey, signature);
      IERC20Upgradeable(tokenContract).transferFrom(msg.sender, address(this), quantizedAmount);
      deployedContractProxy.deposit(starkKey, assetType, vaultId, quantizedAmount);
    }

    function registerAndDeposit(
      uint256 starkKey,
      bytes calldata signature,
      uint256 assetType,
      uint256 vaultId
    ) public payable {
      deployedContractProxy.registerUser(msg.sender, starkKey, signature);
      deployedContractProxy.deposit(starkKey, assetType, vaultId);
    }

    function approveTokenToDeployedProxy(
      address _token
    ) public {
      IERC20Upgradeable(_token).approve(address(deployedContractProxy), 2 ** 96 - 1);
    }
}
