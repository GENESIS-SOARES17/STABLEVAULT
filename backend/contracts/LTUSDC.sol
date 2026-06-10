// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LTUSDC is ERC20, Ownable {
    uint8 private _decimals = 18;
    
    constructor() ERC20("LT Test USD Coin", "LTUSDC") Ownable(msg.sender) {
        _mint(msg.sender, 10_000_000_000 * 10 ** _decimals);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
