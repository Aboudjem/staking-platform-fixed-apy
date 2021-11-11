# StakingPlatform

![HackenAudits](https://img.shields.io/badge/Hacken-Passed-brightgreen?logo=springsecurity)
[![Coverage Status](https://coveralls.io/repos/github/Aboudjem/staking-platform-fixed-apy/badge.svg?branch=features/actions)](https://coveralls.io/github/Aboudjem/staking-platform-fixed-apy?branch=features/actions)
[![MythXBadge](https://badgen.net/https/api.mythx.io/v1/projects/3c2be13e-9b64-42ac-9100-e27db7c8d17a/badge/data?cache=300&icon=https://raw.githubusercontent.com/ConsenSys/mythx-github-badge/main/logo_white.svg)](https://docs.mythx.io/dashboard/github-badges)
![Solidity](https://shields.io/badge/solidity-0.8.9-blue?logo=solidity)

Fixed APY Staking platform with Lockup and fixed APY, duration and max stake

## Workflow

- Deploy StakingPlatform with the appropriate parameters (See _Constructor_ below)
- Users should deposit their tokens before or during the staking period
- Run `Start()` function launch the staking
- Users can claim their rewards using `claimRewards()`
- Once staking is over users can withdraw their initial deposit using `withdraw()` (`withdraw()` calls `claimRewards()`)

## Constructor

```
   constructor(
        address _token,
        uint8 _fixedAPY,
        uint _durationInDays,
        uint _lockupDurationInDays,
        uint _maxStake,
    )
```

- Address of the ERC20 Token to be used by the Staking platform
- fixed APY rates (must be consistent with the maxStake)
- Duration of the staking (e.g, 365 == 1year)
- Lockup duration (Impossible to withdraw until the lockup period is finish)
- Max tokens that can be deposited by stake holders

## Examples

- Staking platform is deployed with 25% of APY
- _User1_ approve `100000 TKN`
- _User1_ deposit `100000 TKN`
- Staking platform starts
- after 1 day User1 can claim `~68.4750 TKN`
- after 1 year User1 can claim `25000 TKN`, 25% of 100,000 TKN

## `StakingPlatform`

### `constructor(address _token, uint8 _fixedAPY, uint256 _durationInDays, uint256 _lockDurationInDays, uint256 _maxAmountStaked)` (public)

constructor contains all the parameters of the staking platform

all parameters are immutable

### `startStaking()` (external)

function that start the staking

set `startPeriod` to the current current `block.timestamp`
set `lockupPeriod` which is `block.timestamp` + `lockupDuration`
and `endPeriod` which is `startPeriod` + `stakingDuration`

### `deposit(uint256 amount)` (external)

function that allows a user to deposit tokens

user must first approve the amount to deposit before calling this function,
cannot exceed the `maxAmountStaked`
`endPeriod` to equal 0 (Staking didn't started yet),
or `endPeriod` more than current `block.timestamp` (staking not finished yet)
totalStaked + amount must be less than `stakingMax`
that the amount deposit should be at least 1E18 (1token)

### `withdraw()` (external)

function that allows a user to withdraw its initial deposit

must be called only when `block.timestamp` >= `endPeriod`
`block.timestamp` higher than `lockupPeriod` (lockupPeriod finished)
withdraw reset all states variable for the `msg.sender` to 0, and claim rewards
if rewards to claim

### `withdrawResidualBalance()` (external)

claim all remaining balance on the contract
Residual balance is all the remaining tokens that have not been distributed
(e.g, in case the number of stakeholders is not sufficient)

Can only be called one year after the end of the staking period
Cannot claim initial stakeholders deposit

### `amountStaked(address stakeHolder) → uint256` (external)

function that returns the amount of total Staked tokens
for a specific user

### `totalDeposited() → uint256` (external)

function that returns the amount of total Staked tokens
on the smart contract

### `rewardOf(address stakeHolder) → uint256` (external)

function that returns the amount of pending rewards
that can be claimed by the user

### `claimRewards()` (external)

function that claims pending rewards

transfer the pending rewards to the `msg.sender`

### `_calculateRewards(address stakeHolder) → uint256` (internal)

calculate rewards based on the `fixedAPY`, `_percentageTimeRemaining()`

the higher is the precision and the more the time remaining will be precise

### `_percentageTimeRemaining(address stakeHolder) → uint256` (internal)

function that returns the remaining time in seconds of the staking period

the higher is the precision and the more the time remaining will be precise
