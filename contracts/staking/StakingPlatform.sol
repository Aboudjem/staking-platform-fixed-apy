// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IStakingPlatform.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingPlatform is IStakingPlatform, Ownable {
    IERC20 public immutable token;
    uint8 public immutable fixedAPY;
    uint public immutable stakingDuration;
    uint public immutable maxAmountStaked;

    uint public startPeriod;
    uint public endPeriod;

    uint private totalStaked = 0;
    uint internal precision = 1E6;

    mapping(address => uint) public staked;
    mapping(address => uint) public stakeRewardsToClaim;
    mapping(address => uint) public claimedRewards;

    constructor(
        address _token,
        uint8 _fixedAPY,
        uint _durationInDays,
        uint _maxAmountStaked
    ) {
        stakingDuration = _durationInDays * 1 days;
        token = IERC20(_token);
        fixedAPY = _fixedAPY;
        maxAmountStaked = _maxAmountStaked;
    }

    function startStaking() external override onlyOwner {
        require(startPeriod == 0, "Staking: Staking already started");
        startPeriod = block.timestamp;
        endPeriod = block.timestamp + stakingDuration;
        emit StartStaking(startPeriod, endPeriod);
    }

    function deposit(uint amount) external override {
        require(
            endPeriod == 0 || endPeriod > block.timestamp,
            "Deposit: Cannot deposit after the end of the period"
        );
        require(
            totalStaked + amount <= maxAmountStaked,
            "Deposit: Amount staked exceeds MaxStake"
        );
        stakeRewardsToClaim[msg.sender] = _calculateRewards(msg.sender);
        if (stakeRewardsToClaim[msg.sender] > 0) {
            claimRewards();
        }
        require(token.transferFrom(msg.sender, address(this), amount), "Error");
        staked[msg.sender] += amount;
        totalStaked += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdraw() external override {
        require(
            block.timestamp >= endPeriod,
            "Lockup: Cannot withdraw until the end of the period"
        );
        totalStaked -= staked[msg.sender];
        uint stakedBalance = staked[msg.sender];
        staked[msg.sender] = 0;
        token.transfer(msg.sender, stakedBalance);
        emit Withdraw(msg.sender, stakedBalance);
    }

    function amountStaked() external view override returns (uint) {
        return staked[msg.sender];
    }

    function totalDeposited() external view override returns (uint) {
        return totalStaked;
    }

    function rewardOf(address _stakeHolder)
        external
        view
        override
        returns (uint)
    {
        return _calculateRewards(_stakeHolder);
    }

    function claimRewards() public override {
        stakeRewardsToClaim[msg.sender] = _calculateRewards(msg.sender);
        require(
            stakeRewardsToClaim[msg.sender] > 0,
            "Staking: Nothing to claim"
        );
        claimedRewards[msg.sender] += _calculateRewards(msg.sender);
        uint stakedRewards = stakeRewardsToClaim[msg.sender];
        stakeRewardsToClaim[msg.sender] = 0;
        token.transfer(msg.sender, stakedRewards);
        emit Claim(msg.sender, stakedRewards);
    }

    function _calculateRewards(address _stakeHolder)
        internal
        view
        returns (uint)
    {
        return
            (((staked[_stakeHolder] * fixedAPY) * _percentageTimeRemaining()) /
                (precision * 100)) - claimedRewards[_stakeHolder];
    }

    function _percentageTimeRemaining() internal view returns (uint) {
        if (endPeriod > block.timestamp) {
            uint timeRemaining = endPeriod - block.timestamp;
            return
                (precision * (stakingDuration - timeRemaining)) /
                stakingDuration;
        }
        return (precision * stakingDuration) / stakingDuration;
    }
}
