// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract StakingPlatform is Ownable  {

    uint public immutable duration;
    uint public totalRewards;
    IERC20 public token;
    uint public start;
    uint public end;
    uint8 fixedAPY;
    uint totalStaked = 0;
    uint maxStake = 50_000_000 * 1E18;

    mapping(address => uint) public stakes;
    mapping(address => uint) public stakeRewards;

    constructor(address _token, uint _duration, uint _rewards, uint8 _fixedAPY) {
        duration = _duration * 1 days;
        totalRewards = _rewards;
        token = IERC20(_token);
        fixedAPY = _fixedAPY;
    }

    function startStaking() external onlyOwner {
        require(start == 0, "Staking already started");
        start = block.timestamp;
        end = block.timestamp + duration;
    }

    function amountStaked() external view returns(uint) {
        return stakes[msg.sender];
    }

    function deposit(uint amount) external {
        require(totalStaked + amount <= maxStake, "Amount staked exceeds MaxStake");
        require(token.transferFrom(msg.sender, address(this), amount), "Error");
        stakes[msg.sender] += amount;
        totalStaked += amount;
    }

    function withdraw() external {
        require(block.timestamp >= end, "Cannot withdraw");
        require(token.transfer(msg.sender, stakes[msg.sender]));
        totalStaked -= stakes[msg.sender];
        stakes[msg.sender] = 0;
    }

    function claimRewards() external {
        stakeRewards[msg.sender] = totalRewarded();
        require(stakeRewards[msg.sender] > 0, "Nothing to claim");
        console.log("Sender balance is %s tokens", stakeRewards[msg.sender]);
        token.transfer(msg.sender, stakeRewards[msg.sender]);
        totalRewards -= stakeRewards[msg.sender];
        stakeRewards[msg.sender] = 0;
    }

    function calculatedReward() public view returns(uint) {
        console.log("staked balance is %s tokens", stakes[msg.sender]);
        console.log("staked rewardable %s tokens", ((stakes[msg.sender] * fixedAPY) / 100));
        return (stakes[msg.sender] * fixedAPY) / 100;
    }

    function calculatePercent() public view returns(uint) {
        if(end > block.timestamp){
            uint timeRemaining = end - block.timestamp; // put in a new getter function
            return 1000000000 * (duration - timeRemaining) / duration;
        }
        return 1000000000 * duration / duration;
    }

    function calculatePercentStaked() public view returns(uint) {
        uint percentStaked = stakes[msg.sender] / totalStaked;
        return 1000000000 * percentStaked;
    }

    function totalRewarded() public view returns(uint) {
        return (calculatePercentStaked() * totalRewards * calculatePercent())/1E18;
    }

}
