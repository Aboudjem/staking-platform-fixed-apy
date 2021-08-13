const { expect } = require("chai");
const { utils } = require("ethers");
const { time } = require('@openzeppelin/test-helpers');


function n18(amount) {
  return utils.parseUnits(amount, 'ether')
}

describe("Token", function () {

  let token;
  let stakingPlatform;

  it("Should deploy the new TreebToken", async() =>  {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(n18('1000000000'));
    await token.deployed();
  });

  it("Should deploy the new staking platform", async() => {
    const StakingPlatform = await ethers.getContractFactory("StakingPlatform");
    stakingPlatform = await StakingPlatform.deploy(token.address, 365, n18('5000000'));
    await stakingPlatform.deployed();
  });

  it("Should send Treeb to staking platform", async() => {
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18('0'));
    await token.transfer(stakingPlatform.address, n18('5000000'));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18('5000000'));
  });

  it("Should deposit to staking platform", async() => {
    await token.approve(stakingPlatform.address, n18('5000'))
    await stakingPlatform.deposit(n18('5000'));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18('5005000'));
  });

  it("Should return the amount staked", async() => {
    expect(await stakingPlatform.amountStaked()).to.equal(n18('5000'));
  });

  it("Should withdraw the staked amount", async() => {
    expect(await stakingPlatform.amountStaked()).to.equal(n18('5000'));
    await stakingPlatform.withdraw();
    expect(await stakingPlatform.amountStaked()).to.equal(n18('0'));
  });

  it("Should return the percent remaining", async() => {
    await token.approve(stakingPlatform.address, n18('500000'))
    await stakingPlatform.deposit(n18('500000'));

    await stakingPlatform.startStaking();
    // await time.increase(200000000)
    const sevenDays = 24 * 60 * 60 * 364;

    // const blockNumBefore = await ethers.provider.getBlockNumber();
    // const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    // const timestampBefore = blockBefore.timestamp;
    //
    // console.log(blockBefore)
    console.log((await stakingPlatform.totalRewards()).toString());

    console.log((await stakingPlatform.calculatePercent()).toString());

    console.log((await stakingPlatform.start()).toString())
    console.log((await stakingPlatform.end()).toString())
    await ethers.provider.send('evm_increaseTime', [sevenDays+(23*(60 * 60))]);
    await ethers.provider.send('evm_mine');

    console.log((await stakingPlatform.calculatePercent()).toString());

    console.log((await stakingPlatform.calculatePercentStaked()).toString());
    console.log((await stakingPlatform.totalRewarded()).toString());
    // totalRewarded
  });









  });
