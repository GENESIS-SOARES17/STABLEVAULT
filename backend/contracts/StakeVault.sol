// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakeVault is Ownable, ReentrancyGuard {
    IERC20 public ltusdc;
    uint256 public monthlyRateBps;
    uint256 public earlyWithdrawPenaltyBps = 5000;
    
    uint256[] public durations;
    mapping(uint256 => uint256) public durationBonusBps;
    
    struct Stake {
        uint256 id;
        address user;
        uint256 amount;
        uint256 stakeTime;
        uint256 duration;
        uint256 rewardRate;
        bool active;
    }
    
    mapping(address => uint256[]) public userStakeIds;
    mapping(uint256 => Stake) public stakes;
    uint256 public nextStakeId = 1;
    uint256 public totalStaked;
    uint256 public totalStakersCount;
    mapping(address => bool) public isStaker;
    
    event Staked(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 duration, uint256 rewardRate);
    event Unstaked(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 interest, bool earlyWithdraw, uint256 penalty);
    event PartialUnstaked(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 interest, uint256 remainingAmount);

    constructor(address _ltusdc, uint256 _monthlyRateBps) Ownable(msg.sender) {
        ltusdc = IERC20(_ltusdc);
        monthlyRateBps = _monthlyRateBps;
        _addDuration(30, 50);   // 5.5%
        _addDuration(60, 100);  // 6%
        _addDuration(90, 200);  // 7%
        _addDuration(180, 400); // 9%
    }
    
    function _addDuration(uint256 _days, uint256 _bonusBps) internal {
        durations.push(_days);
        durationBonusBps[_days] = _bonusBps;
    }
    
    function stake(uint256 _amount, uint256 _duration) external nonReentrant returns (uint256) {
        require(_amount > 0, "Amount must be > 0");
        require(isValidDuration(_duration), "Invalid duration");
        uint256 rewardRate = monthlyRateBps + durationBonusBps[_duration];
        require(ltusdc.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        uint256 stakeId = nextStakeId++;
        stakes[stakeId] = Stake({
            id: stakeId,
            user: msg.sender,
            amount: _amount,
            stakeTime: block.timestamp,
            duration: _duration,
            rewardRate: rewardRate,
            active: true
        });
        userStakeIds[msg.sender].push(stakeId);
        if (!isStaker[msg.sender]) {
            isStaker[msg.sender] = true;
            totalStakersCount++;
        }
        totalStaked += _amount;
        emit Staked(stakeId, msg.sender, _amount, _duration, rewardRate);
        return stakeId;
    }
    
    function partialUnstake(uint256 _stakeId, uint256 _amount) external nonReentrant {
        Stake storage userStake = stakes[_stakeId];
        require(userStake.active, "Stake not active");
        require(userStake.user == msg.sender, "Not your stake");
        require(_amount > 0, "Amount must be > 0");
        require(_amount <= userStake.amount, "Amount exceeds stake");
        
        uint256 interest = _calculateInterest(_stakeId);
        uint256 penalty = 0;
        bool earlyWithdraw = false;
        uint256 unlockTime = userStake.stakeTime + (userStake.duration * 1 days);
        
        if (block.timestamp < unlockTime) {
            earlyWithdraw = true;
            uint256 proportionalInterest = (interest * _amount) / userStake.amount;
            penalty = (proportionalInterest * earlyWithdrawPenaltyBps) / 10000;
            interest = proportionalInterest - penalty;
        } else {
            interest = (interest * _amount) / userStake.amount;
        }
        
        uint256 totalAmount = _amount + interest;
        
        if (_amount == userStake.amount) {
            userStake.active = false;
            totalStaked -= _amount;
            emit Unstaked(_stakeId, msg.sender, _amount, interest, earlyWithdraw, penalty);
        } else {
            userStake.amount -= _amount;
            userStake.stakeTime = block.timestamp;
            totalStaked -= _amount;
            emit PartialUnstaked(_stakeId, msg.sender, _amount, interest, userStake.amount);
        }
        require(ltusdc.transfer(msg.sender, totalAmount), "Transfer failed");
    }
    
    function unstake(uint256 _stakeId) external nonReentrant {
        Stake storage userStake = stakes[_stakeId];
        require(userStake.active, "Stake not active");
        require(userStake.user == msg.sender, "Not your stake");
        uint256 interest = _calculateInterest(_stakeId);
        uint256 penalty = 0;
        bool earlyWithdraw = false;
        uint256 unlockTime = userStake.stakeTime + (userStake.duration * 1 days);
        if (block.timestamp < unlockTime) {
            earlyWithdraw = true;
            penalty = (interest * earlyWithdrawPenaltyBps) / 10000;
            interest -= penalty;
        }
        uint256 totalAmount = userStake.amount + interest;
        uint256 principal = userStake.amount;
        userStake.active = false;
        totalStaked -= principal;
        require(ltusdc.transfer(msg.sender, totalAmount), "Transfer failed");
        emit Unstaked(_stakeId, msg.sender, principal, interest, earlyWithdraw, penalty);
    }
    
    function _calculateInterest(uint256 _stakeId) internal view returns (uint256) {
        Stake memory userStake = stakes[_stakeId];
        if (!userStake.active || userStake.amount == 0) return 0;
        uint256 timeElapsed = block.timestamp - userStake.stakeTime;
        return (userStake.amount * userStake.rewardRate * timeElapsed) / (30 days * 10000);
    }
    
    function calculateInterest(uint256 _stakeId) external view returns (uint256) {
        return _calculateInterest(_stakeId);
    }
    
    function isValidDuration(uint256 _duration) public view returns (bool) {
        for (uint256 i = 0; i < durations.length; i++) {
            if (durations[i] == _duration) return true;
        }
        return false;
    }
    
    function getStakeInfo(uint256 _stakeId) external view returns (uint256 id, address user, uint256 amount, uint256 stakeTime, uint256 duration, uint256 rewardRate, bool active) {
        Stake memory userStake = stakes[_stakeId];
        return (userStake.id, userStake.user, userStake.amount, userStake.stakeTime, userStake.duration, userStake.rewardRate, userStake.active);
    }
    
    function getUserStakes(address user) external view returns (Stake[] memory) {
        uint256[] memory ids = userStakeIds[user];
        Stake[] memory result = new Stake[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) result[i] = stakes[ids[i]];
        return result;
    }
    
    function getUserActiveStakes(address user) external view returns (Stake[] memory) {
        uint256[] memory ids = userStakeIds[user];
        uint256 activeCount = 0;
        for (uint256 i = 0; i < ids.length; i++) if (stakes[ids[i]].active) activeCount++;
        Stake[] memory result = new Stake[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) if (stakes[ids[i]].active) result[idx++] = stakes[ids[i]];
        return result;
    }
    
    function getTotalStakers() external view returns (uint256) { return totalStakersCount; }
    function getTotalStaked() external view returns (uint256) { return totalStaked; }
    function getDurations() external view returns (uint256[] memory) { return durations; }
    function getUserStakeCount(address user) external view returns (uint256) { return userStakeIds[user].length; }
    
    function updatePenalty(uint256 _newPenaltyBps) external onlyOwner {
        require(_newPenaltyBps <= 10000, "Invalid penalty");
        earlyWithdrawPenaltyBps = _newPenaltyBps;
    }
    
    function withdrawPenalties() external onlyOwner {
        uint256 balance = ltusdc.balanceOf(address(this));
        uint256 penalties = balance > totalStaked ? balance - totalStaked : 0;
        require(penalties > 0, "No penalties to withdraw");
        require(ltusdc.transfer(owner(), penalties), "Transfer failed");
    }
}
