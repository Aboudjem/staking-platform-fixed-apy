# StakingPlatform

Fixed APY Staking platform with Lockup and fixed APY, duration and max stake 

## Workflow

- Deploy StakingPlatform with the appropriate parameters (See *Constructor* below)
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

- User1 deposit `100000 TKN`
- after 1 day User1 can claim `~68.4750 TKN`
- after 1 year User1 can claim `25000 TKN`, 25% of 100,000 TKN
