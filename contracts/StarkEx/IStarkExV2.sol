pragma solidity >=0.6.12 < 0.9.0;

// SPDX-License-Identifier: MIT

interface IStarkExV2 {
    function registerEthAddress(
      address ethKey,
      uint256 starkKey,
      bytes calldata signature
    ) external;

    function deposit(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId,
      uint256 quantizedAmount
    ) external;

    function deposit(
      uint256 starkKey,
      uint256 assetType,
      uint256 vaultId
    ) external payable;

    function getWithdrawalBalance(
      uint256 starkKey,
      uint256 tokenId
    ) external view returns (uint256);


    function getQuantum(
      uint256 presumedAssetType
    ) external view returns (uint256);

    function getAssetInfo(
      uint256 assetType
    ) external view returns (bytes memory);
}
