pragma solidity >=0.6.12 < 0.9.0;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/drafts/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PermitMintableERC20 is ERC20, ERC20Permit {

  constructor(string memory name, string memory symbol) public ERC20(name, symbol) ERC20Permit(name) {}

  function mint(address destination, uint256 amount) public {
    _mint(destination, amount);
  }
}
