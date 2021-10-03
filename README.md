# StakingPlatform

[![Coverage Status](https://coveralls.io/repos/github/Aboudjem/staking-platform-fixed-apy/badge.svg?branch=features/actions)](https://coveralls.io/github/Aboudjem/staking-platform-fixed-apy?branch=features/actions)
[![MythXBadge](https://badgen.net/https/api.mythx.io/v1/projects/3c2be13e-9b64-42ac-9100-e27db7c8d17a/badge/data?cache=300&icon=https://raw.githubusercontent.com/ConsenSys/mythx-github-badge/main/logo_white.svg)](https://docs.mythx.io/dashboard/github-badges)
![Solidity](https://shields.io/badge/solidity-0.8.8-blue?logo=solidity)

Fixed APY Staking platform with Lockup and fixed APY, duration and max stake

## Workflow

- Deploy StakingPlatform with the appropriate parameters (See _Constructor_ below)
- Users should deposit their tokens before or during the staking period
- Run `Start()` function launch the staking
- Users can claim their rewards using `claimRewards()`
- Once staking is finished users can withdraw their initial deposit using `withdraw()`

## Constructor

```
   constructor(
        address _token,
        uint8 _fixedAPY,
        uint _durationInDays,
        uint _maxStake
    )
```

- Address of the ERC20 Token to be used by the Staking platform
- fixed APY rates (must be consistent with the maxStake)
- Duration (e.g, 365 == 1year)
- Maximum of tokens that can be deposited

## Examples

- Staking platform is deployed with 25% of APY
- _User1_ deposit `100000 TKN`
- Staking platform starts
- after 1 day User1 can claim `~68.4750 TKN`
- after 1 year User1 can claim `25000 TKN`, 25% of 100,000 TKN
