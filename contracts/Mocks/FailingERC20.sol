pragma solidity >=0.6.12 < 0.9.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FailingMintableERC20 is ERC20 {

  constructor(string memory name, string memory symbol) public ERC20(name, symbol) {}

  function mint(address destination, uint256 amount) public {
    _mint(destination, amount);
  }

  function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
    revert();
  }
}
