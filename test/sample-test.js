const { n18, increaseTime } = require("./helpers");
const { expect } = require('chai');
const { utils } = require('ethers');


describe('Token', () => {
  let token;
  let stakingPlatform;

  it('Should deploy the new TreebToken', async () => {
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy(n18('1000000000'));
    await token.deployed();
  });

  it('Should deploy the new staking platform', async () => {
    const StakingPlatform = await ethers.getContractFactory('StakingPlatform');
    stakingPlatform = await StakingPlatform.deploy(token.address, 365, n18('5000000'), 25);
    await stakingPlatform.deployed();
  });

  it('Should send Treeb to staking platform', async () => {
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18('0'));
    await token.transfer(stakingPlatform.address, n18('5000000'));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18('5000000'));
  });

  it('Should deposit to staking platform', async () => {
    await token.approve(stakingPlatform.address, n18('5000'));
    await stakingPlatform.deposit(n18('5000'));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18('5005000'));
  });

  it('Should return the amount staked', async () => {
    expect(await stakingPlatform.amountStaked()).to.equal(n18('5000'));
  });

  it('Should withdraw the staked amount', async () => {
    expect(await stakingPlatform.amountStaked()).to.equal(n18('5000'));
    await stakingPlatform.withdraw();
    expect(await stakingPlatform.amountStaked()).to.equal(n18('0'));
  });

  it('Should deposit 500 000 Tokens', async () => {
    await token.approve(stakingPlatform.address, n18('500000'));
    await stakingPlatform.deposit(n18('500000'));
  });

  it('Should start Staking and ending period should last 1 year', async () => {
    expect((await stakingPlatform.start()).toString()).to.equal('0');
    await stakingPlatform.startStaking();
    expect((await stakingPlatform.start()).toString()).to.not.equal('0');
    expect((await stakingPlatform.end() - await stakingPlatform.start()).toString()).to.equal('31536000');
  });

  it('Should return amount of reward after half a year', async () => {
    expect(utils.formatEther(await stakingPlatform.totalRewards())).to.equal('5000000.0');
  });

  it('Should return the percentage time spent since beggining', async () => {
    expect((await stakingPlatform.calculatePercent()).toString()).to.equal('0');
  });

  it('Should return amount of reward after half a year', async () => {
    const halfYear = 24 * 60 * 60 * 183;
    console.log('calculated Rewards', (await stakingPlatform.calculatedReward()).toString());


    // increase ~halfYear time
    await increaseTime(halfYear);

    console.log((await stakingPlatform.calculatePercent()).toString());

    console.log((await stakingPlatform.calculatePercentStaked()).toString());
    console.log(utils.formatEther(await stakingPlatform.totalRewarded()).toString());
    await stakingPlatform.claimRewards();
    // await stakingPlatform.withdraw();
    // totalRewarded

    console.log(utils.formatEther(await token.balanceOf(stakingPlatform.address)).toString());
  });

  it('Should return amount of reward after termination date', async () => {
    const halfYear = 24 * 60 * 60 * 183;

    // increase ~halfYear time
    await increaseTime(halfYear);

    console.log((await stakingPlatform.calculatePercent()).toString());

    console.log((await stakingPlatform.calculatePercentStaked()).toString());
    console.log(utils.formatEther(await stakingPlatform.totalRewarded()).toString());
    await stakingPlatform.claimRewards();

    console.log(utils.formatEther(await token.balanceOf(stakingPlatform.address)).toString());
  });

  it('Should withdraw', async () => {
    console.log(utils.formatEther(await token.balanceOf(stakingPlatform.address)).toString());

    await stakingPlatform.withdraw();
    console.log(utils.formatEther(await token.balanceOf(stakingPlatform.address)).toString());

  });


});
