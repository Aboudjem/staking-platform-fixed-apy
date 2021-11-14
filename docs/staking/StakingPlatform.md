## `StakingPlatform`

### `constructor(address _token, uint8 _fixedAPY, uint256 _durationInDays, uint256 _lockDurationInDays, uint256 _maxAmountStaked)` (public)

constructor contains all the parameters of the staking platform

all parameters are immutable

### `startStaking()` (external)

function that start the staking

set `startPeriod` to the current `block.timestamp`
set `lockupPeriod` which is `block.timestamp` + `lockupDuration`
and `endPeriod` which is `startPeriod` + `stakingDuration`

### `deposit(uint256 amount)` (external)

function that allows a user to deposit tokens

user must first approve the amount to deposit before calling this function,
cannot exceed the `maxAmountStaked`
`endPeriod` to equal 0 (Staking didn't started yet),
or `endPeriod` more than current `block.timestamp` (staking not finished yet)
`totalStaked + amount` must be less than `stakingMax`
that the amount deposited should greater than 0

### `withdraw(uint256 amount)` (external)

function that allows a user to withdraw its initial deposit

`block.timestamp` must be higher than `lockupPeriod` (lockupPeriod finished)
`amount` must be higher than `0`
`amount` must be lower or equal to the amount staked
withdraw reset all states variable for the `msg.sender` to 0, and claim rewards
if rewards to claim

### `withdrawAll()` (external)

function that allows a user to withdraw its initial deposit

must be called only when `block.timestamp` >= `lockupPeriod`
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
