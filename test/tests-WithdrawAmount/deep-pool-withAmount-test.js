const { n18, increaseTime, UINT_MAX } = require("../helpers");
const { expect } = require("chai");

describe("StakingPlatform - Deep Pool - withdrawal with amount", () => {
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
    for (let i = 1; i <= 7; i++) {
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
      (await stakingPlatform.amountStaked(addresses[1])).toString()
    ).to.equal("100000000000000000000000");
  });

  it("Should return and claim rewards staked after 1 day", async () => {
    await increaseTime(60 * 60 * 24);

    const user1 = (
      await stakingPlatform.calculatedReward(addresses[1])
    ).toString();
    expect(user1).to.equal("68475000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "68475000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("239662500000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "239662500000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();
    expect(user3).to.equal("25335750000000000000");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "25335750000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();
    expect(user4).to.equal("1369500000000000000");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "1369500000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.calculatedReward(addresses[5])
    ).toString();
    expect(user5).to.equal("1266787500000000000000");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "1266787500000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[5])).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.calculatedReward(addresses[6])
    ).toString();
    expect(user6).to.equal("22596750000000000000");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "22596750000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[6])).toString()
    ).to.equal("0");
  });

  it("Should return the amount staked after 1 day", async () => {
    await increaseTime(60 * 60 * 24);

    const user1 = (
      await stakingPlatform.calculatedReward(addresses[1])
    ).toString();
    expect(user1).to.equal("68475000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "68475000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "136950000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("239662500000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "239662500000000000000"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "479325000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();
    expect(user3).to.equal("25335750000000000000");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "25335750000000000000"
    );
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "50671500000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();
    expect(user4).to.equal("1369500000000000000");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "1369500000000000000"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2739000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.calculatedReward(addresses[5])
    ).toString();
    expect(user5).to.equal("1266787500000000000000");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "1266787500000000000000"
    );
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2533575000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[5])).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.calculatedReward(addresses[6])
    ).toString();
    expect(user6).to.equal("22596750000000000000");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "22596750000000000000"
    );
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "45193500000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[6])).toString()
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
    expect(user1RewardsAfter).to.equal("68475000000000000000");
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
      "ERC20: transfer amount exceeds allowance"
    );
  });

  it("Should fail withdraw residual before ending period", async () => {
    await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
      "Withdraw 1year after endPeriod"
    );
  });

  it("Should fail withdraw tokens before ending period", async () => {
    await expect(stakingPlatform.withdrawAll()).to.revertedWith(
      "No withdraw until lockup ends"
    );
  });

  it("Should fail claiming tokens", async () => {
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
      stakingPlatform.connect(accounts[7]).withdrawAll()
    ).to.revertedWith("No withdraw until lockup ends");
  });

  it("Should not withdraw tokens after 200days lockup still active", async () => {
    await increaseTime(200 * 60 * 60 * 24);
    const userRewards = (
      await stakingPlatform.rewardOf(addresses[7])
    ).toString();
    expect(userRewards).to.equal("1390412500000000000000");

    await expect(
      stakingPlatform.connect(accounts[7]).withdrawAll()
    ).to.revertedWith("No withdraw until lockup ends");
  });

  it("Should fail claiming tokens", async () => {
    await expect(stakingPlatform.claimRewards());
    await expect(stakingPlatform.claimRewards()).to.revertedWith(
      "Nothing to claim"
    );
  });

  it("Should withdraw tokens after ending period", async () => {
    await increaseTime(200 * 60 * 60 * 24);

    let userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();
    expect(userRewards).to.equal("2500000000000000000000");

    await stakingPlatform
      .connect(accounts[7])
      .withdraw(await stakingPlatform.amountStaked(addresses[7]));

    const userBalance = (await token.balanceOf(addresses[7])).toString();
    userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();

    expect(userBalance).to.equal("12500000000000000000000");
    expect(userRewards).to.equal("0");
  });

  it("Should return the amount staked after 1000 days", async () => {
    await increaseTime(1000 * 60 * 60 * 24);

    await stakingPlatform.setPrecision(28);
    const user1 = (
      await stakingPlatform.calculatedReward(addresses[1])
    ).toString();
    expect(user1).to.be.oneOf([
      "24863007356671740233384",
      "24863006563926940639269",
    ]);
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "136950000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.be.oneOf([
      "24999957356671740233384",
      "24999956563926940639269",
    ]);
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("87020522973744292237442");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "479325000000000000000"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "87499847973744292237442"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();
    expect(user3).to.equal("9199312135337392186707");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "50671500000000000000"
    );
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9249983635337392186707"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();
    expect(user4).to.equal("497260099568746829020");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2739000000000000000"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "499999099568746829020"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.calculatedReward(addresses[5])
    ).toString();
    expect(user5).to.equal("459965577435312024353120");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2533575000000000000000"
    );
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "462499152435312024353120"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[5])).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.calculatedReward(addresses[6])
    ).toString();
    expect(user6).to.equal("8204791119672754946727");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "45193500000000000000"
    );
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8249984619672754946727"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[6])).toString()
    ).to.equal("0");
  });

  it("Should withdraw initial deposit", async () => {
    await stakingPlatform.setPrecision(8);

    expect((await token.balanceOf(addresses[1])).toString()).to.be.oneOf([
      "24999957356671740233384",
      "24999956563926940639269",
    ]);
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "87499847973744292237442"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9249983635337392186707"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "499999099568746829020"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "462499152435312024353120"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8249984619672754946727"
    );
    for (let i = 0; i < 7; i++) {
      await stakingPlatform
        .connect(accounts[i])
        .withdraw(await stakingPlatform.amountStaked(addresses[i]));
    }

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "124999957356671740233384"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "437499847973744292237442"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "46249983635337392186707"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2499999099568746829020"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2312499152435312024353120"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "41249984619672754946727"
    );
  });

  it("Should withdraw residual balances", async () => {
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.be.oneOf(["4156556144879693049213600", "4156556134879693049213600"]);
    expect((await token.balanceOf(addresses[0])).toString()).to.equal(
      "992865944940000000000000000"
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
      "997022501074879693049213600"
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
        (await stakingPlatform.amountStaked(addresses[i])).toString()
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
