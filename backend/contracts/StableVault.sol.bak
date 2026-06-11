// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StableVault is Ownable, ReentrancyGuard {
    IERC20 public ltusdc;
    uint256 public mintFee;
    uint256 public monthlyRateBps;
    uint256 public mintAmount;
    uint256 public airdropAmount;

    mapping(address => bool) public hasClaimedAirdrop;

    struct Deposit {
        uint256 amount;
        uint256 timestamp;
        uint256 accumulatedInterest;
    }

    mapping(address => Deposit) public deposits;
    address[] public depositors;
    mapping(address => bool) public isDepositor;

    event AirdropClaimed(address indexed user, uint256 amount);
    event Minted(address indexed user, uint256 amount, uint256 fee);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 principal, uint256 interest);
    event PartialWithdrawn(address indexed user, uint256 amount, uint256 interest, uint256 remainingAmount);

    constructor(
        address _ltusdc,
        uint256 _airdropAmount,
        uint256 _mintAmount,
        uint256 _mintFee,
        uint256 _monthlyRateBps
    ) Ownable(msg.sender) {
        ltusdc = IERC20(_ltusdc);
        airdropAmount = _airdropAmount;
        mintAmount = _mintAmount;
        mintFee = _mintFee;
        monthlyRateBps = _monthlyRateBps;
    }

    function claimAirdrop() external nonReentrant {
        require(!hasClaimedAirdrop[msg.sender], "Airdrop already claimed");
        require(ltusdc.balanceOf(address(this)) >= airdropAmount, "Insufficient LTUSDC balance");
        hasClaimedAirdrop[msg.sender] = true;
        require(ltusdc.transfer(msg.sender, airdropAmount), "Airdrop failed");
        emit AirdropClaimed(msg.sender, airdropAmount);
    }

    function mintLTUSDC() external payable nonReentrant {
        require(msg.value >= mintFee, "Insufficient fee");
        require(ltusdc.balanceOf(address(this)) >= mintAmount, "Insufficient LTUSDC balance");
        require(ltusdc.transfer(msg.sender, mintAmount), "Mint failed");
        emit Minted(msg.sender, mintAmount, msg.value);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(ltusdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        if (!isDepositor[msg.sender]) {
            depositors.push(msg.sender);
            isDepositor[msg.sender] = true;
        }
        uint256 interest = calculateInterest(msg.sender);
        deposits[msg.sender].amount += amount;
        deposits[msg.sender].timestamp = block.timestamp;
        deposits[msg.sender].accumulatedInterest += interest;
        emit Deposited(msg.sender, amount);
    }

    function partialWithdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender].amount > 0, "No deposit");
        require(amount > 0, "Amount must be > 0");
        require(amount <= deposits[msg.sender].amount, "Amount exceeds deposit");
        uint256 interest = calculateInterest(msg.sender);
        uint256 principal = deposits[msg.sender].amount;
        uint256 proportionalInterest = (interest * amount) / principal;
        if (amount == principal) {
            _removeDepositor(msg.sender);
            deposits[msg.sender].amount = 0;
            deposits[msg.sender].timestamp = 0;
            deposits[msg.sender].accumulatedInterest = 0;
            emit Withdrawn(msg.sender, principal, interest);
        } else {
            deposits[msg.sender].amount -= amount;
            deposits[msg.sender].accumulatedInterest = interest - proportionalInterest;
            deposits[msg.sender].timestamp = block.timestamp;
            emit PartialWithdrawn(msg.sender, amount, proportionalInterest, deposits[msg.sender].amount);
        }
        uint256 totalAmount = amount + proportionalInterest;
        require(ltusdc.transfer(msg.sender, totalAmount), "Transfer failed");
    }

    function withdraw() external nonReentrant {
        require(deposits[msg.sender].amount > 0, "No deposit");
        uint256 interest = calculateInterest(msg.sender);
        uint256 totalAmount = deposits[msg.sender].amount + interest;
        uint256 principal = deposits[msg.sender].amount;
        _removeDepositor(msg.sender);
        deposits[msg.sender].amount = 0;
        deposits[msg.sender].timestamp = 0;
        deposits[msg.sender].accumulatedInterest = 0;
        require(ltusdc.transfer(msg.sender, totalAmount), "Transfer failed");
        emit Withdrawn(msg.sender, principal, interest);
    }

    function _removeDepositor(address user) internal {
        if (!isDepositor[user]) return;
        for (uint256 i = 0; i < depositors.length; i++) {
            if (depositors[i] == user) {
                depositors[i] = depositors[depositors.length - 1];
                depositors.pop();
                isDepositor[user] = false;
                break;
            }
        }
    }

    function calculateInterest(address user) public view returns (uint256) {
        Deposit memory dep = deposits[user];
        if (dep.amount == 0 || dep.timestamp == 0) return dep.accumulatedInterest;
        uint256 timeElapsed = block.timestamp - dep.timestamp;
        uint256 interest = (dep.amount * monthlyRateBps * timeElapsed) / (30 days * 10000);
        return dep.accumulatedInterest + interest;
    }

    function getDepositInfo(address user) external view returns (uint256 principal, uint256 interest, uint256 total, uint256 depositTime) {
        Deposit memory dep = deposits[user];
        uint256 intAccrued = calculateInterest(user);
        return (dep.amount, intAccrued, dep.amount + intAccrued, dep.timestamp);
    }

    function getAirdropStatus(address user) external view returns (bool) {
        return hasClaimedAirdrop[user];
    }

    function getTotalDepositors() external view returns (uint256) {
        return depositors.length;
    }

    function getTotalValueLocked() external view returns (uint256) {
        uint256 tvl = 0;
        for (uint256 i = 0; i < depositors.length; i++) {
            tvl += deposits[depositors[i]].amount;
        }
        return tvl;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}
