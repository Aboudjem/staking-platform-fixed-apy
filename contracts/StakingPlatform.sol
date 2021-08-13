// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingPlatform is Ownable  {

    uint public immutable duration;
    uint public immutable totalRewards;
    IERC20 public token;
    uint public start;
    uint public end;
    uint totalStaked = 0;

    mapping(address => uint) public stakes;
    mapping(address => uint) public stakeRewards;

    constructor(address _token, uint _duration, uint _rewards) {
        duration = _duration * 1 days;
        totalRewards = _rewards;
        token = IERC20(_token);
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
        require(stakeRewards[msg.sender] > 0, "Nothing to claim");
        token.transfer(msg.sender, stakeRewards[msg.sender]);
        stakeRewards[msg.sender] = 0;
    }

    function calculatePercent() public view returns(uint) {
        uint timeRemaining = end - block.timestamp; // put in a new getter function
        return 1000000000 * (duration - timeRemaining) / duration;
    }

    function calculatePercentStaked() public view returns(uint) {
        uint percentStaked = stakes[msg.sender] / totalStaked;
        return 1000000000 * percentStaked;
    }

    function totalRewarded() public view returns(uint) {
        return (calculatePercentStaked() * totalRewards * calculatePercent())/1E18;
    }



//    function rewardPerToken() public view returns (uint256) {
//        if (_totalSupply == 0) {
//            return rewardPerTokenStored;
//        }
//        return
//        rewardPerTokenStored + (
//            lastTimeRewardApplicable() - (lastUpdateTime) * (rewardRate).mul(1e18) / (_totalSupply)
//        );
//    }


//    function _stake(uint256 _amount) internal{
//        // Simple check so that user does not stake 0
//        require(_amount > 0, "Cannot stake nothing");
//
//
//        // Mappings in solidity creates all values, but empty, so we can just check the address
//        uint256 index = stakes[msg.sender];
//        // block.timestamp = timestamp of the current block in seconds since the epoch
//        uint256 timestamp = block.timestamp;
//        // See if the staker already has a staked index or if its the first time
//        if(index == 0){
//            // This stakeholder stakes for the first time
//            // We need to add him to the stakeHolders and also map it into the Index of the stakes
//            // The index returned will be the index of the stakeholder in the stakeholders array
//            index = _addStakeholder(msg.sender);
//        }
//
//        // Use the index to push a new Stake
//        // push a newly created Stake with the current block timestamp.
//        stakeholders[index].address_stakes.push(Stake(msg.sender, _amount, timestamp));
//        // Emit an event that the stake has occured
//        emit Staked(msg.sender, _amount, index,timestamp);
//    }


//    function rewards() external view returns(uint);

}
