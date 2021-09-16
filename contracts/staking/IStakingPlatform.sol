// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IStakingPlatform {
    function startStaking() external;

    function deposit(uint amount) external;

    function withdraw() external;

    function amountStaked() external view returns (uint);

    function totalDeposited() external view returns (uint);

    function rewardOf(address _stakeHolder) external view returns (uint);

    function claimRewards() external;

    /**
     * @dev Emitted when `value` tokens are deposited into
     * staking platform
     */
    event Deposit(address indexed owner, uint amount);

    /**
     * @dev Emitted when user withdraw deposited amount
     */
    event Withdraw(address indexed owner, uint amount);

    /**
     * @dev Emitted when user claim rewards
     */
    event Claim(address indexed stakeHolder, uint amount);

    /**
     * @dev Emitted when user claim rewards
     */
    event StartStaking(uint startPeriod, uint endingPeriod);
}
