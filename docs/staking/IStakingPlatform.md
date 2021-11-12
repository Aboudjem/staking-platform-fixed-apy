## `IStakingPlatform`

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
`totalStaked + amount` must be less than `stakingMax`
that the amount deposited should greater than 0

### `withdrawAll()` (external)

function that allows a user to withdraw its initial deposit

must be called only when `block.timestamp` >= `endPeriod`
`block.timestamp` higher than `lockupPeriod` (lockupPeriod finished)
withdraw reset all states variable for the `msg.sender` to 0, and claim rewards
if rewards to claim

### `withdraw(uint256 amount)` (external)

function that allows a user to withdraw its initial deposit

`block.timestamp` must be higher than `lockupPeriod` (lockupPeriod finished)
`amount` must be higher than `0`
`amount` must be lower or equal to the amount staked
withdraw reset all states variable for the `msg.sender` to 0, and claim rewards
if rewards to claim

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

### `Deposit(address owner, uint256 amount)`

Emitted when `amount` tokens are deposited into
staking platform

### `Withdraw(address owner, uint256 amount)`

Emitted when user withdraw deposited `amount`

### `Claim(address stakeHolder, uint256 amount)`

Emitted when `stakeHolder` claim rewards

### `StartStaking(uint256 startPeriod, uint256 lockupPeriod, uint256 endingPeriod)`

Emitted when staking has started
