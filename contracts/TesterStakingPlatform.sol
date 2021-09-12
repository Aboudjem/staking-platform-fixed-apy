// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./StakingPlatform.sol";

contract StakingPlatformTester is StakingPlatform {
    constructor(
        address _token,
        uint8 _fixedAPY,
        uint _durationInDays,
        uint _maxStaking
    ) StakingPlatform(_token, _fixedAPY, _durationInDays, _maxStaking) {}

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
