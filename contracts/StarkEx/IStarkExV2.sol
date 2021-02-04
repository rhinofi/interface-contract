pragma solidity 0.6.12;


interface IStarkExV2 {
    function registerUser(
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
}
