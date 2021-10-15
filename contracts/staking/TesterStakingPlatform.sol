// SPDX-License-Identifier: MIT
pragma solidity =0.8.9;

import "./StakingPlatform.sol";

contract StakingPlatformTester is StakingPlatform {
    constructor(
        address _token,
        uint8 _fixedAPY,
        uint _durationInDays,
        uint _lockupDurationInDays,
        uint _stakingMax
    )
        StakingPlatform(
            _token,
            _fixedAPY,
            _durationInDays,
            _lockupDurationInDays,
            _stakingMax
        )
    {}

    function setPrecision(uint _precision) public {
        precision = 10**_precision;
    }

    function calculatedReward() external view returns (uint) {
        return _calculateRewards(msg.sender);
    }

    function percentageTimeRemaining() external view returns (uint) {
        return _percentageTimeRemaining();
    }
}
