// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingPlatform is Ownable {
    IERC20 public token;

    uint8 public fixedAPY;

    uint public start;
    uint public end;

    uint public immutable duration;

    uint private totalStaked = 0;
    uint internal precision = 1E6;
    uint public immutable maxStaking;

    mapping(address => uint) public staked;
    mapping(address => uint) public stakeRewards;
    mapping(address => uint) public claimedRewards;

    constructor(
        address _token,
        uint8 _fixedAPY,
        uint _durationInDays,
        uint _maxStake
    ) {
        duration = _durationInDays * 1 days;
        token = IERC20(_token);
        fixedAPY = _fixedAPY;
        maxStaking = _maxStake;
    }

    function startStaking() external onlyOwner {
        require(start == 0, "Staking: Staking already started");
        start = block.timestamp;
        end = block.timestamp + duration;
    }

    function deposit(uint amount) external {
        require(
            end == 0 || end > block.timestamp,
            "Deposit: Cannot deposit after the end of the period"
        );
        require(
            totalStaked + amount <= maxStaking,
            "Deposit: Amount staked exceeds MaxStake"
        );
        stakeRewards[msg.sender] = _calculatedReward();
        if (stakeRewards[msg.sender] > 0) {
            claimRewards();
        }
        require(token.transferFrom(msg.sender, address(this), amount), "Error");
        staked[msg.sender] += amount;
        totalStaked += amount;
    }

    function withdraw() external {
        require(
            block.timestamp >= end,
            "Lockup: Cannot withdraw until the end of the period"
        );
        totalStaked -= staked[msg.sender];
        staked[msg.sender] = 0;
        token.transfer(msg.sender, staked[msg.sender]);
    }

    function claimRewards() public {
        stakeRewards[msg.sender] = _calculatedReward();
        require(stakeRewards[msg.sender] > 0, "Staking: Nothing to claim");
        claimedRewards[msg.sender] += _calculatedReward();
        stakeRewards[msg.sender] = 0;
        token.transfer(msg.sender, stakeRewards[msg.sender]);
    }

    function amountStaked() external view returns (uint) {
        return staked[msg.sender];
    }

    function totalDeposited() external view returns (uint) {
        return totalStaked;
    }

    function _calculatedReward() internal view returns (uint) {
        return
            (((staked[msg.sender] * fixedAPY) * _percentageTimeRemaining()) /
                (precision * 100)) - claimedRewards[msg.sender];
    }

    function _percentageTimeRemaining() internal view returns (uint) {
        if (end > block.timestamp) {
            uint timeRemaining = end - block.timestamp;
            return (precision * (duration - timeRemaining)) / duration;
        }
        return (precision * duration) / duration;
    }
}
