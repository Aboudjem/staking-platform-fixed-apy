// SPDX-License-Identifier: MIT
pragma solidity =0.8.10;

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

    function setPrecision(uint precision_) public {
        _precision = 10**precision_;
    }

    function calculatedReward(address stakeHolder)
        external
        view
        returns (uint)
    {
        return _calculateRewards(stakeHolder);
    }

    function percentageTimeRemaining(address stakeHolder)
        external
        view
        returns (uint)
    {
        return _percentageTimeRemaining(stakeHolder);
    }
}
