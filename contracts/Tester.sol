// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./StakingPlatform.sol";

contract Tester is StakingPlatform {
    constructor(
        address _token,
        uint _duration,
        uint _rewards,
        uint8 _fixedAPY
    ) StakingPlatform(_token, _duration, _rewards, _fixedAPY) {}

    function setPrecision(uint _precision) public {
        precision = 10**_precision;
    }

    function calculatedReward() external view returns (uint) {
        return _calculatedReward();
    }

    function percentageTimeRemaining() external view returns (uint) {
        return _percentageTimeRemaining();
    }
}
