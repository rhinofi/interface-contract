pragma solidity >=0.6.12 < 0.9.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FailingMockStarkExV2 {

    IERC20 testToken;

    constructor(address _token) public  {
      testToken = IERC20(_token);
    }

    function registerUser(
      address ethKey,
      uint256 starkKey,
      bytes calldata signature
    ) external {
      require(false, "Revert in StarkEx");
    }

    function deposit(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId,
      uint256 quantizedAmount
    ) external {
      require(false, "Revert in StarkEx");
    }

    function deposit(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId
    ) external payable {
      require(false, "Revert in StarkEx");
    }

    function getQuantum(
      uint256 presumedAssetType
    ) external view returns (uint256) {
      return 10 ** 8;
    }

    function getAssetInfo(
      uint256 assetType
    ) external view returns (bytes memory) {
      return abi.encodePacked(bytes16(0xf47261b0000000000000000000000000), address(testToken));
    }
}
