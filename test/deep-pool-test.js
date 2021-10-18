const { n18, increaseTime, UINT_MAX } = require("./helpers");
const { expect } = require("chai");

describe("StakingPlatform - Deep Pool", () => {
  let token;
  let stakingPlatform;
  let accounts;
  let addresses;

  it("Should deploy the new Token", async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(n18("1000000000"));
    await token.deployed();
    accounts = await ethers.getSigners();
    addresses = accounts.map((account) => account.address);
  });

  it("should distribute tokens among users", async () => {
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    await token.transfer(addresses[1], n18("100000"));
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "100000000000000000000000"
    );

    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await token.transfer(addresses[2], n18("350000"));
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "350000000000000000000000"
    );

    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    await token.transfer(addresses[3], n18("37000"));
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "37000000000000000000000"
    );

    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await token.transfer(addresses[4], n18("2000"));
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2000000000000000000000"
    );

    expect((await token.balanceOf(addresses[5])).toString()).to.equal("0");
    await token.transfer(addresses[5], n18("1850000"));
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "1850000000000000000000000"
    );

    expect((await token.balanceOf(addresses[6])).toString()).to.equal("0");
    await token.transfer(addresses[6], n18("33000"));
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "33000000000000000000000"
    );

    await token.transfer(addresses[7], n18("10000"));
    expect((await token.balanceOf(addresses[7])).toString()).to.equal(
      "10000000000000000000000"
    );
  });

  it("Should deploy the new staking platform", async () => {
    const StakingPlatform = await ethers.getContractFactory(
      "StakingPlatformTester"
    );
    stakingPlatform = await StakingPlatform.deploy(
      token.address,
      25,
      365,
      365,
      n18("20000000")
    );
    await stakingPlatform.deployed();
  });

  it("Should send tokens to staking platform", async () => {
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18("0"));
    await token.transfer(stakingPlatform.address, n18("5000000"));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(
      n18("5000000")
    );
  });

  it("Should deposit to staking platform", async () => {
    for (let i = 1; i <= 8; i++) {
      const balance = await token.balanceOf(addresses[i]);
      await token
        .connect(accounts[i])
        .approve(stakingPlatform.address, UINT_MAX);
      await stakingPlatform.connect(accounts[i]).deposit(balance);
      expect((await token.balanceOf(addresses[i])).toString()).to.equal("0");
    }
  });

  it("Should return the amount staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("2382000"));
  });

  it("Should start Staking and ending period should last 1 year", async () => {
    expect((await stakingPlatform.startPeriod()).toString()).to.equal("0");
    await stakingPlatform.startStaking();
    expect((await stakingPlatform.startPeriod()).toString()).to.not.equal("0");
    expect(
      (
        (await stakingPlatform.endPeriod()) -
        (await stakingPlatform.startPeriod())
      ).toString()
    ).to.equal("31536000");
  });

  it("Should fail if trying to start Staking twice", async () => {
    await expect(stakingPlatform.startStaking()).to.revertedWith(
      "Staking has already started"
    );
  });

  it("Should return the amount staked", async () => {
    expect(
      (await stakingPlatform.connect(accounts[1]).amountStaked()).toString()
    ).to.equal("100000000000000000000000");
  });

  it("Should return and claim rewards staked after 1 day", async () => {
    await increaseTime(60 * 60 * 24);
    expect(
      (await stakingPlatform.percentageTimeRemaining()).toString()
    ).to.equal("2739");

    const user1 = (
      await stakingPlatform.connect(accounts[1]).calculatedReward()
    ).toString();
    expect(user1).to.equal("68475000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "68475000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[1]).calculatedReward()).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.connect(accounts[2]).calculatedReward()
    ).toString();
    expect(user2).to.equal("239662500000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "239662500000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[2]).calculatedReward()).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.connect(accounts[3]).calculatedReward()
    ).toString();
    expect(user3).to.equal("25335750000000000000");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "25335750000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[3]).calculatedReward()).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.connect(accounts[4]).calculatedReward()
    ).toString();
    expect(user4).to.equal("1369500000000000000");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "1369500000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[4]).calculatedReward()).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.connect(accounts[5]).calculatedReward()
    ).toString();
    expect(user5).to.equal("1266787500000000000000");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "1266787500000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[5]).calculatedReward()).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.connect(accounts[6]).calculatedReward()
    ).toString();
    expect(user6).to.equal("22596750000000000000");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "22596750000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[6]).calculatedReward()).toString()
    ).to.equal("0");
  });

  it("Should return the amount staked after 1 day", async () => {
    await increaseTime(60 * 60 * 24);

    const user1 = (
      await stakingPlatform.connect(accounts[1]).calculatedReward()
    ).toString();
    expect(user1).to.equal("68500000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "68475000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "136975000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[1]).calculatedReward()).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.connect(accounts[2]).calculatedReward()
    ).toString();
    expect(user2).to.equal("239750000000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "239662500000000000000"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "479412500000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[2]).calculatedReward()).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.connect(accounts[3]).calculatedReward()
    ).toString();
    expect(user3).to.equal("25345000000000000000");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "25335750000000000000"
    );
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "50680750000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[3]).calculatedReward()).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.connect(accounts[4]).calculatedReward()
    ).toString();
    expect(user4).to.equal("1370000000000000000");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "1369500000000000000"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2739500000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[4]).calculatedReward()).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.connect(accounts[5]).calculatedReward()
    ).toString();
    expect(user5).to.equal("1267250000000000000000");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "1266787500000000000000"
    );
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2534037500000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[5]).calculatedReward()).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.connect(accounts[6]).calculatedReward()
    ).toString();
    expect(user6).to.equal("22605000000000000000");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "22596750000000000000"
    );
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "45201750000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[6]).calculatedReward()).toString()
    ).to.equal("0");
  });

  it("Should return the amount of rewards for a specific user after 1 day", async () => {
    const user1RewardsBefore = (
      await stakingPlatform.rewardOf(addresses[1])
    ).toString();
    expect(user1RewardsBefore).to.equal("0");

    await increaseTime(60 * 60 * 24);

    const user1RewardsAfter = (
      await stakingPlatform.rewardOf(addresses[1])
    ).toString();
    expect(user1RewardsAfter).to.equal("68500000000000000000");
  });

  it("Should revert if exceed the max staking amount", async () => {
    await token.approve(stakingPlatform.address, n18("50000000"));
    await expect(stakingPlatform.deposit(n18("50000000"))).to.revertedWith(
      "Amount staked exceeds MaxStake"
    );
  });

  it("Should deposit 100 000 tokens", async () => {
    await token.approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.deposit(n18("100000"));
  });

  it("Should deposit 900 000 tokens", async () => {
    await token.approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.deposit(n18("900000"));
  });

  it("Should fail deposit tokens", async () => {
    await token.approve(stakingPlatform.address, 0);
    await expect(stakingPlatform.deposit(n18("100000"))).to.revertedWith(
      "Increase allowance"
    );
  });

  it("Should fail withdraw residual before ending period", async () => {
    await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
      "Withdraw 1year after endPeriod"
    );
  });

  it("Should fail withdraw tokens before ending period", async () => {
    await expect(stakingPlatform.withdraw()).to.revertedWith(
      "No withdraw until lockup ends"
    );
  });

  it("Should fail claiming tokens", async () => {
    await expect(stakingPlatform.claimRewards());
    await expect(stakingPlatform.claimRewards()).to.revertedWith(
      "Nothing to claim"
    );
  });

  it("Should not withdraw tokens before lockup period", async () => {
    const userBalance = (await token.balanceOf(addresses[7])).toString();
    expect(userBalance).to.equal("0");

    const userRewards = (
      await stakingPlatform.rewardOf(addresses[7])
    ).toString();
    expect(userRewards).to.equal("20547500000000000000");
    await expect(
      stakingPlatform.connect(accounts[7]).withdraw()
    ).to.revertedWith("No withdraw until lockup ends");
  });

  it("Should not withdraw tokens after 200days lockup still active", async () => {
    await increaseTime(200 * 60 * 60 * 24);
    const userRewards = (
      await stakingPlatform.rewardOf(addresses[7])
    ).toString();
    expect(userRewards).to.equal("1390412500000000000000");

    await expect(
      stakingPlatform.connect(accounts[7]).withdraw()
    ).to.revertedWith("No withdraw until lockup ends");
  });

  it("Should withdraw tokens after ending period", async () => {
    await increaseTime(200 * 60 * 60 * 24);

    let userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();
    expect(userRewards).to.equal("2500000000000000000000");

    await stakingPlatform.connect(accounts[7]).withdraw();

    const userBalance = (await token.balanceOf(addresses[7])).toString();
    userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();

    expect(userBalance).to.equal("12500000000000000000000");
    expect(userRewards).to.equal("0");
  });

  it("Should return the amount staked after 1000 days", async () => {
    await increaseTime(1000 * 60 * 60 * 24);

    await stakingPlatform.setPrecision(28);
    const user1 = (
      await stakingPlatform.connect(accounts[1]).calculatedReward()
    ).toString();
    expect(user1).to.equal("24863025000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "136975000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "25000000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[1]).calculatedReward()).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.connect(accounts[2]).calculatedReward()
    ).toString();
    expect(user2).to.equal("87020587500000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "479412500000000000000"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "87500000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[2]).calculatedReward()).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.connect(accounts[3]).calculatedReward()
    ).toString();
    expect(user3).to.equal("9199319250000000000000");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "50680750000000000000"
    );
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9250000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[3]).calculatedReward()).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.connect(accounts[4]).calculatedReward()
    ).toString();
    expect(user4).to.equal("497260500000000000000");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2739500000000000000"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "500000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[4]).calculatedReward()).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.connect(accounts[5]).calculatedReward()
    ).toString();
    expect(user5).to.equal("459965962500000000000000");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2534037500000000000000"
    );
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "462500000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[5]).calculatedReward()).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.connect(accounts[6]).calculatedReward()
    ).toString();
    expect(user6).to.equal("8204798250000000000000");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "45201750000000000000"
    );
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8250000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[6]).calculatedReward()).toString()
    ).to.equal("0");
  });

  it("Should withdraw initial deposit", async () => {
    await stakingPlatform.setPrecision(8);

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "25000000000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "87500000000000000000000"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9250000000000000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "500000000000000000000"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "462500000000000000000000"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8250000000000000000000"
    );
    for (let i = 0; i <= 8; i++) {
      await stakingPlatform.connect(accounts[i]).withdraw();
    }

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "125000000000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "437500000000000000000000"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "46250000000000000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2500000000000000000000"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2312500000000000000000000"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "41250000000000000000000"
    );
  });

  it("Should withdraw residual balances", async () => {
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("4154448631250000000000000");
    expect((await token.balanceOf(addresses[0])).toString()).to.equal(
      "992868051368750000000000000"
    );

    await token.transfer(
      stakingPlatform.address,
      "120000000000000000000000000"
    );

    await stakingPlatform.withdrawResidualBalance();

    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("0");
    expect((await token.balanceOf(addresses[0])).toString()).to.equal(
      "997022500000000000000000000"
    );
  });

  it("Should fail withdraw residual if nothing to withdraw after increasing 1000days", async () => {
    await increaseTime(1000 * 24 * 60 * 60);
    await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
      "No residual Balance to withdraw"
    );
  });

  it("Should return the amount staked once staking finished and withdrew", async () => {
    for (let i = 1; i <= 8; i++) {
      expect(
        (await stakingPlatform.connect(accounts[i]).amountStaked()).toString()
      ).to.equal("0");
    }
  });

  it("Should fail deposit after staking ended", async () => {
    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await expect(
      stakingPlatform.connect(accounts[1]).deposit("1000")
    ).to.be.revertedWith("Staking period ended");
  });

  it("Should return the amount staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("0"));
  });
});
