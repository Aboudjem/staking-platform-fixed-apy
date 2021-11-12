const { n18, increaseTime, UINT_MAX } = require("../helpers");
const { expect } = require("chai");

describe("StakingPlatform - Restake - withdrawal with amount", () => {
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
    await token.transfer(addresses[2], n18("200000"));
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "200000000000000000000000"
    );

    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    await token.transfer(addresses[3], n18("100000"));
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "100000000000000000000000"
    );

    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await token.transfer(addresses[4], n18("200000"));
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "200000000000000000000000"
    );
  });

  it("Should deploy the new staking platform", async () => {
    const StakingPlatform = await ethers.getContractFactory(
      "StakingPlatformTester"
    );
    stakingPlatform = await StakingPlatform.deploy(
      token.address,
      10,
      365,
      100,
      n18("20000000")
    );
    await stakingPlatform.deployed();
  });

  // it("Should set precision to 2", async () => {
  //   await stakingPlatform.setPrecision(4);
  // });

  it("Should send tokens to staking platform", async () => {
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18("0"));
    await token.transfer(stakingPlatform.address, n18("50000000"));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(
      n18("50000000")
    );
  });

  it("Should deposit to staking platform for user1 and user2", async () => {
    const balance1 = await token.balanceOf(addresses[1]);
    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[1]).deposit(balance1);
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");

    const balance2 = await token.balanceOf(addresses[2]);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[2]).deposit(balance2);
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
  });

  it("Should return the amount staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("300000"));
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

    expect(user1).to.equal("27390000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "27390000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("54780000000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "54780000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");
  });

  it("Should return the amount staked after 1 day (2days passed)", async () => {
    await increaseTime(60 * 60 * 24);

    const user1 = (
      await stakingPlatform.calculatedReward(addresses[1])
    ).toString();
    expect(user1).to.equal("27390000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "27390000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "54780000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("54780000000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "54780000000000000000"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "109560000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");
  });

  it("Should return the amount staked after 10 days (12days passed)", async () => {
    let user1;
    let user2;

    for (let i = 0; i < 10; i++) {
      await increaseTime(60 * 60 * 24);

      user1 = (await stakingPlatform.calculatedReward(addresses[1])).toString();
      user2 = (await stakingPlatform.calculatedReward(addresses[2])).toString();
    }

    expect(user1).to.equal("273970000000000000000");
    expect(user2).to.equal("547940000000000000000");

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "54780000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "109560000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "328750000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "657500000000000000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");
  });

  it("Should deposit balance for user1 & user2", async () => {
    const balance1 = await token.balanceOf(addresses[1]);
    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[1]).deposit(balance1);
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");

    const balance2 = await token.balanceOf(addresses[2]);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[2]).deposit(balance2);
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");

    expect(
      (await stakingPlatform.amountStaked(addresses[1])).toString()
    ).to.equal("100328750000000000000000");
    expect(
      (await stakingPlatform.amountStaked(addresses[2])).toString()
    ).to.equal("200657500000000000000000");
  });

  it("Should return the amount staked after increasing staked for 10days (22days passed)", async () => {
    let user1;
    let user2;

    for (let i = 0; i < 10; i++) {
      await increaseTime(60 * 60 * 24);

      user1 = await stakingPlatform.rewardOf(addresses[1]);
      user2 = await stakingPlatform.rewardOf(addresses[2]);
    }

    expect(user1).to.equal("274870676375000000000");
    expect(user2).to.equal("549741352750000000000");

    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");

    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "274870676375000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "549741352750000000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");
  });

  it("Should return the amount staked after increasing staked for 10days (32days passed)", async () => {
    let user1;
    let user2;

    for (let i = 0; i < 10; i++) {
      await increaseTime(60 * 60 * 24);

      user1 = await stakingPlatform.rewardOf(addresses[1]);
      user2 = await stakingPlatform.rewardOf(addresses[2]);
    }

    expect(user1).to.equal("274870676375000000000");
    expect(user2).to.equal("549741352750000000000");

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "274870676375000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "549741352750000000000"
    );

    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "549741352750000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "1099482705500000000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");
  });

  it("Should deposit a second time balance for user1 & user2", async () => {
    const balance1 = await token.balanceOf(addresses[1]);
    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[1]).deposit(balance1);
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");

    const balance2 = await token.balanceOf(addresses[2]);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[2]).deposit(balance2);
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");

    expect(
      (await stakingPlatform.amountStaked(addresses[1])).toString()
    ).to.equal("100878491352750000000000");
    expect(
      (await stakingPlatform.amountStaked(addresses[2])).toString()
    ).to.equal("201756982705500000000000");
  });

  it("Should withdraw after 100days for user1 and user2", async () => {
    await increaseTime(100 * 60 * 60 * 24);

    const balanceUser1Before = await token.balanceOf(addresses[1]);
    const balanceUser2Before = await token.balanceOf(addresses[2]);

    expect(balanceUser1Before.toString()).to.equal("0");
    expect(balanceUser2Before.toString()).to.equal("0");

    const rewardUser1 = await stakingPlatform.calculatedReward(addresses[1]);
    const rewardUser2 = await stakingPlatform.calculatedReward(addresses[2]);

    const amountStakedUser1 = await stakingPlatform.amountStaked(addresses[1]);
    const amountStakedUser2 = await stakingPlatform.amountStaked(addresses[2]);

    expect(rewardUser1).to.equal("2763788203289562300000");

    expect(rewardUser2).to.equal("5527576406579124600000");

    expect(amountStakedUser1).to.equal("100878491352750000000000");

    expect(amountStakedUser2).to.equal("201756982705500000000000");

    await stakingPlatform
      .connect(accounts[1])
      .withdraw(await stakingPlatform.amountStaked(addresses[1]));
    await stakingPlatform
      .connect(accounts[2])
      .withdraw(await stakingPlatform.amountStaked(addresses[2]));

    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");

    const balanceUser1After = await token.balanceOf(addresses[1]);
    const balanceUser2After = await token.balanceOf(addresses[2]);

    expect(balanceUser1After.toString()).to.equal(
      amountStakedUser1.add(rewardUser1)
    );
    expect(balanceUser2After.toString()).to.equal(
      amountStakedUser2.add(rewardUser2)
    );
  });

  it("Should have 0 rewards for user1 & user2 after 10days", async () => {
    const user1Rewards = await stakingPlatform.rewardOf(addresses[1]);
    const user2Rewards = await stakingPlatform.rewardOf(addresses[2]);

    expect(user1Rewards).to.equal("0");
    expect(user2Rewards).to.equal("0");
  });

  it("Should deposit balance for user3 & user4 (122days passed)", async () => {
    await increaseTime(100 * 60 * 60 * 24);

    const balance3 = await token.balanceOf(addresses[3]);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[3]).deposit(balance3);
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");

    await stakingPlatform.connect(accounts[1]).deposit(balance3);
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "3642279556039562300000"
    );

    const balance4 = await token.balanceOf(addresses[4]);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");

    await stakingPlatform.connect(accounts[2]).deposit(balance4);
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "7284559112079124600000"
    );
  });

  it("Should return the amount staked after 10 days (132days passed)", async () => {
    let user1;
    let user2;
    let user3;
    let user4;

    for (let i = 0; i < 10; i++) {
      await increaseTime(60 * 60 * 24);

      user1 = (await stakingPlatform.calculatedReward(addresses[1])).toString();

      user2 = (await stakingPlatform.calculatedReward(addresses[2])).toString();

      user3 = (await stakingPlatform.calculatedReward(addresses[3])).toString();

      user4 = (await stakingPlatform.calculatedReward(addresses[4])).toString();
    }

    expect(user1).to.equal("273970000000000000000");
    expect(user2).to.equal("547940000000000000000");

    expect(user3).to.equal("273970000000000000000");
    expect(user4).to.equal("547940000000000000000");

    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");

    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();
    await stakingPlatform.connect(accounts[3]).claimRewards();
    await stakingPlatform.connect(accounts[4]).claimRewards();

    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "273970000000000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "547940000000000000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");
    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");
  });

  it("Should deposit balance for user3 & user4", async () => {
    const balance3 = await token.balanceOf(addresses[3]);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[3]).deposit(balance3);
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");

    const balance4 = await token.balanceOf(addresses[4]);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
  });

  it("Should return the amount staked after 30 days", async () => {
    let user1;
    let user2;
    let user3;
    let user4;

    for (let i = 0; i < 30; i++) {
      await increaseTime(60 * 60 * 24);

      user1 = (await stakingPlatform.calculatedReward(addresses[1])).toString();

      user2 = (await stakingPlatform.calculatedReward(addresses[2])).toString();

      user3 = (await stakingPlatform.calculatedReward(addresses[3])).toString();

      user4 = (await stakingPlatform.calculatedReward(addresses[4])).toString();
    }
    expect(user1).to.equal("821920000000000000000");

    expect(user2).to.be.oneOf([
      "1643840000000000000000",
      "1643820000000000000000",
    ]);

    expect(user3).to.equal("824161786827000000000");
    expect(user4).to.equal("1648323573654000000000");

    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");

    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();

    await stakingPlatform.connect(accounts[3]).claimRewards();
    await stakingPlatform.connect(accounts[4]).claimRewards();

    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "824161786827000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "1648323573654000000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");
  });

  it("Should re-deposit balance for user3 & user4", async () => {
    const balance3 = await token.balanceOf(addresses[3]);
    await stakingPlatform.connect(accounts[3]).deposit(balance3);
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");

    const balance4 = await token.balanceOf(addresses[4]);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
  });

  it("Should return the amount staked after 30 more days", async () => {
    let user1;
    let user2;
    let user3;
    let user4;

    for (let i = 0; i < 30; i++) {
      await increaseTime(60 * 60 * 24);

      user1 = (await stakingPlatform.calculatedReward(addresses[1])).toString();

      user2 = (await stakingPlatform.calculatedReward(addresses[2])).toString();

      user3 = (await stakingPlatform.calculatedReward(addresses[3])).toString();

      user4 = (await stakingPlatform.calculatedReward(addresses[4])).toString();
    }
    expect(user1).to.equal("821910000000000000000");

    expect(user2).to.equal("1643820000000000000000");

    expect(user3).to.equal("830935654969109795700");
    expect(user4).to.equal("1661871309938219591400");

    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");

    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();

    await stakingPlatform.connect(accounts[3]).claimRewards();
    await stakingPlatform.connect(accounts[4]).claimRewards();

    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "830935654969109795700"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "1661871309938219591400"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");
  });

  it("Should return the amount of rewards for a specific user after 1 day", async () => {
    const user1RewardsBefore = (
      await stakingPlatform.rewardOf(addresses[3])
    ).toString();
    expect(user1RewardsBefore).to.equal("0");

    await increaseTime(60 * 60 * 24);

    const user1RewardsAfter = (
      await stakingPlatform.rewardOf(addresses[3])
    ).toString();
    expect(user1RewardsAfter).to.equal("27690778296411915300");
  });

  it("Should revert if exceed the max staking amount", async () => {
    await token.approve(stakingPlatform.address, n18("50000000"));
    await expect(stakingPlatform.deposit(n18("50000000"))).to.revertedWith(
      "Amount staked exceeds MaxStake"
    );
  });

  it("Should deposit 1 000 000 tokens with user5", async () => {
    await token.transfer(addresses[5], n18("1000000"));
    await token.connect(accounts[5]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[5]).deposit(n18("1000000"));
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

  it("Should return 0 rewards after 0 days", async () => {
    expect(
      (await stakingPlatform.calculatedReward(addresses[0])).toString()
    ).to.equal("0");
  });

  it("Should revert if nothing to claim after 0 days", async () => {
    await expect(stakingPlatform.claimRewards()).to.revertedWith(
      "Nothing to claim"
    );
  });

  it("Should loop and try to withdraw / deposit", async () => {
    const balanceBefore = await token.balanceOf(addresses[0]);
    await token.approve(stakingPlatform.address, UINT_MAX);

    for (let i = 0; i < 30; i++) {
      expect(
        (await stakingPlatform.calculatedReward(addresses[0])).toString()
      ).to.equal("0");

      await stakingPlatform.withdraw(
        await stakingPlatform.amountStaked(addresses[0])
      );
      await stakingPlatform.deposit(n18("1000000"));
      expect(
        (await stakingPlatform.calculatedReward(addresses[0])).toString()
      ).to.equal("0");
    }

    const balanceAfter = await token.balanceOf(addresses[0]);

    expect(balanceBefore).to.equal(balanceAfter);
  });

  it("Should return 0 rewards after 0 days", async () => {
    expect(
      (await stakingPlatform.calculatedReward(addresses[0])).toString()
    ).to.equal("0");
  });

  it("Should return rewards after 1 day", async () => {
    await increaseTime(60 * 60 * 24);
    expect(
      (await stakingPlatform.calculatedReward(addresses[0])).toString()
    ).to.equal("273900000000000000000");
  });

  it("Should deposit 1 000 000 tokens with user6", async () => {
    await token.transfer(addresses[6], n18("1000000"));
    await token.connect(accounts[6]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[6]).deposit(n18("1000000"));
  });

  it("Should deposit 1 000 000 tokens with user7", async () => {
    await token.transfer(addresses[7], n18("1100000"));
    await token.connect(accounts[7]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[7]).deposit(n18("1000000"));
  });

  it("Should return rewards after 100 day", async () => {
    await increaseTime(59 * 60 * 60 * 24);
    expect(
      (await stakingPlatform.calculatedReward(addresses[0])).toString()
    ).to.equal("16438300000000000000000");

    await stakingPlatform.claimRewards();
  });

  it("Should return rewards for user7", async () => {
    expect(
      (await stakingPlatform.calculatedReward(addresses[7])).toString()
    ).to.equal("16164300000000000000000");

    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));

    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));

    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));

    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));

    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));
    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));
    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));
    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));
    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));
    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    await stakingPlatform.connect(accounts[7]).deposit(n18("10000"));
    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "16164300000000000000000"
    );

    expect(
      (await stakingPlatform.amountStaked(addresses[7])).toString()
    ).to.equal(n18("1100000"));

    await stakingPlatform.connect(accounts[7]).claimRewards();

    expect((await stakingPlatform.rewardOf(addresses[7])).toString()).to.equal(
      "0"
    );
    await increaseTime(2 * 60 * 60 * 24);

    expect(
      (await stakingPlatform.calculatedReward(addresses[7])).toString()
    ).to.be.oneOf(["602250000000000000000", "602140000000000000000"]);

    await stakingPlatform.connect(accounts[7]).claimRewards();
    expect(
      (await stakingPlatform.calculatedReward(addresses[7])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.amountStaked(addresses[7])).toString()
    ).to.equal("1100000000000000000000000");

    await stakingPlatform
      .connect(accounts[7])
      .withdraw(await stakingPlatform.amountStaked(addresses[7]));

    expect(
      (await stakingPlatform.amountStaked(addresses[7])).toString()
    ).to.equal("0");
  });

  it("Should return when finished", async () => {
    await increaseTime(59 * 60 * 60 * 24);
    expect(
      (await stakingPlatform.calculatedReward(addresses[0])).toString()
    ).to.equal("547500000000000000000");

    await stakingPlatform.claimRewards();
  });

  it("Should return amount rewards for user5", async () => {
    expect(
      (await stakingPlatform.calculatedReward(addresses[5])).toString()
    ).to.equal("16986100000000000000000");
  });

  it("Should return amount rewards for user6", async () => {
    expect(
      (await stakingPlatform.calculatedReward(addresses[6])).toString()
    ).to.equal("16711900000000000000000");
  });

  // it("Should fail withdraw tokens before ending period", async () => {
  //   await expect(stakingPlatform.withdrawAll()).to.revertedWith(
  //     "No withdraw until lockup ends"
  //   );
  // });

  // it("Should fail claiming tokens (144 days passed)", async () => {
  //   await increaseTime(60 * 60 * 24);
  //
  //   await expect(stakingPlatform.claimRewards());
  //   await expect(stakingPlatform.claimRewards()).to.revertedWith(
  //     "Nothing to claim"
  //   );
  // });
  //
  // it("Should not withdraw tokens after 200days lockup still active (344 days passed)", async () => {
  //   await increaseTime(200 * 60 * 60 * 24);
  //
  //   await expect(
  //     stakingPlatform.connect(accounts[7]).withdrawAll()
  //   ).to.revertedWith("No withdraw until lockup ends");
  // });

  // it("Should deposit to staking platform for user3 and user4", async () => {
  //   const balance3 = await token.balanceOf(addresses[3]);
  //   await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
  //   await stakingPlatform.connect(accounts[3]).deposit(balance3);
  //   expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
  //
  //   const balance4 = await token.balanceOf(addresses[4]);
  //   await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
  //   await stakingPlatform.connect(accounts[4]).deposit(balance4);
  //   expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
  // });
  //
  // it("Should return the total amount staked", async () => {
  //   expect(await stakingPlatform.totalDeposited()).to.equal(
  //     "1603457403610000000000000"
  //   );
  // });
  //
  // it("Should return and claim rewards staked after 1 day (345 days passed)", async () => {
  //   await stakingPlatform.connect(accounts[3]).claimRewards();
  //   const user3Before = (
  //     await stakingPlatform.calculatedReward(addresses[3])
  //   ).toString();
  //
  //   expect(user3Before).to.equal("0");
  //
  //   await increaseTime(60 * 60 * 24);
  //
  //   const user3 = (
  //     await stakingPlatform.calculatedReward(addresses[3])
  //   ).toString();
  //   expect(user3).to.equal("27148093193700000000");
  //   expect((await token.balanceOf(addresses[3])).toString()).to.equal(
  //     "5566866053114200000000"
  //   );
  //   await stakingPlatform.connect(accounts[3]).claimRewards();
  //   expect((await token.balanceOf(addresses[3])).toString()).to.equal(
  //     "5594014146307900000000"
  //   );
  //   expect(
  //     (await stakingPlatform.calculatedReward(addresses[3])).toString()
  //   ).to.equal("0");
  //
  //   const user4 = (
  //     await stakingPlatform.calculatedReward(addresses[4])
  //   ).toString();
  //   expect(user4).to.equal("87807192615800000000");
  //   expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
  //   await stakingPlatform.connect(accounts[4]).claimRewards();
  //   expect((await token.balanceOf(addresses[4])).toString()).to.equal(
  //     "11188028292615800000000"
  //   );
  //   expect(
  //     (await stakingPlatform.calculatedReward(addresses[4])).toString()
  //   ).to.equal("0");
  // });
  //
  // it("Should withdraw tokens after ending period (845days passed)", async () => {
  //   await increaseTime(500 * 60 * 60 * 24);
  //
  //   let userRewards = (await stakingPlatform.rewardOf(addresses[1])).toString();
  //   expect(userRewards).to.equal("9456422896000000000000");
  //
  //   await stakingPlatform.connect(accounts[1]).withdrawAll();
  //
  //   const userBalance = (await token.balanceOf(addresses[1])).toString();
  //   userRewards = (await stakingPlatform.rewardOf(addresses[1])).toString();
  //
  //   expect(userBalance).to.equal("110060397456000000000000");
  //   expect(userRewards).to.equal("0");
  // });
  //
  // it("Should withdraw tokens after ending period", async () => {
  //   await increaseTime(200 * 60 * 60 * 24);
  //
  //   let userRewards = (await stakingPlatform.rewardOf(addresses[3])).toString();
  //   expect(userRewards).to.equal("551005743338800000000");
  //
  //   await stakingPlatform.connect(accounts[3]).withdrawAll();
  //
  //   const userBalance = (await token.balanceOf(addresses[3])).toString();
  //   userRewards = (await stakingPlatform.rewardOf(addresses[3])).toString();
  //
  //   expect(userBalance).to.equal("106693513199646700000000");
  //   expect(userRewards).to.equal("0");
  // });
  //
  // it("Should return the amount staked after 1000 days", async () => {
  //   await increaseTime(1000 * 60 * 60 * 24);
  //
  //   // await stakingPlatform.setPrecision(28);
  //   const user1 = (
  //     await stakingPlatform.calculatedReward(addresses[1])
  //   ).toString();
  //   expect(user1).to.equal("0");
  //   expect((await token.balanceOf(addresses[1])).toString()).to.equal(
  //     "110060397456000000000000"
  //   );
  //   // await stakingPlatform.connect(accounts[1]).claimRewards();
  //   // expect((await token.balanceOf(addresses[1])).toString()).to.equal(
  //   //   "25000000000000000000000"
  //   // );
  //   expect(
  //     (await stakingPlatform.calculatedReward(addresses[1])).toString()
  //   ).to.equal("0");
  //
  //   const user3 = (
  //     await stakingPlatform.calculatedReward(addresses[3])
  //   ).toString();
  //   expect(user3).to.equal("0");
  //
  //   expect((await token.balanceOf(addresses[3])).toString()).to.equal(
  //     "106693513199646700000000"
  //   );
  //
  //   expect(
  //     (await stakingPlatform.calculatedReward(addresses[3])).toString()
  //   ).to.equal("0");
  //
  //   const user2 = (
  //     await stakingPlatform.calculatedReward(addresses[2])
  //   ).toString();
  //   expect(user2).to.equal("18912845792000000000000");
  //   expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
  //   await stakingPlatform.connect(accounts[2]).claimRewards();
  //   expect((await token.balanceOf(addresses[2])).toString()).to.equal(
  //     "18912845792000000000000"
  //   );
  //   expect(
  //     (await stakingPlatform.calculatedReward(addresses[2])).toString()
  //   ).to.equal("0");
  //
  //   const user4 = (
  //     await stakingPlatform.calculatedReward(addresses[4])
  //   ).toString();
  //   expect(user4).to.equal("1102011486677600000000");
  //   expect((await token.balanceOf(addresses[4])).toString()).to.equal(
  //     "11188028292615800000000"
  //   );
  //   await stakingPlatform.connect(accounts[4]).claimRewards();
  //   expect((await token.balanceOf(addresses[4])).toString()).to.equal(
  //     "12290039779293400000000"
  //   );
  //   expect(
  //     (await stakingPlatform.calculatedReward(addresses[4])).toString()
  //   ).to.equal("0");
  // });
  //
  // it("Should withdraw initial deposit", async () => {
  //   // await stakingPlatform.setPrecision(8);
  //
  //   // expect((await token.balanceOf(addresses[1])).toString()).to.equal(
  //   //   "25000000000000000000000"
  //   // );
  //   // expect((await token.balanceOf(addresses[2])).toString()).to.equal(
  //   //   "87500000000000000000000"
  //   // );
  //   // expect((await token.balanceOf(addresses[3])).toString()).to.equal(
  //   //   "9250000000000000000000"
  //   // );
  //   // expect((await token.balanceOf(addresses[4])).toString()).to.equal(
  //   //   "500000000000000000000"
  //   // );
  //   // expect((await token.balanceOf(addresses[5])).toString()).to.equal(
  //   //   "462500000000000000000000"
  //   // );
  //   // expect((await token.balanceOf(addresses[6])).toString()).to.equal(
  //   //   "8250000000000000000000"
  //   // );
  //   for (let i = 0; i <= 8; i++) {
  //     await stakingPlatform.connect(accounts[i]).withdrawAll();
  //   }
  //
  //   expect((await token.balanceOf(addresses[1])).toString()).to.equal(
  //     "110060397456000000000000"
  //   );
  //   expect((await token.balanceOf(addresses[2])).toString()).to.equal(
  //     "220120794912000000000000"
  //   );
  //   expect((await token.balanceOf(addresses[3])).toString()).to.equal(
  //     "106693513199646700000000"
  //   );
  //   expect((await token.balanceOf(addresses[4])).toString()).to.equal(
  //     "213387026399293400000000"
  //   );
  //   expect((await token.balanceOf(addresses[5])).toString()).to.equal("0");
  //   expect((await token.balanceOf(addresses[6])).toString()).to.equal("0");
  // });
  //
  // it("Should withdraw residual balances", async () => {
  //   expect(
  //     (await token.balanceOf(stakingPlatform.address)).toString()
  //   ).to.equal("49888918268033059900000000");
  //   expect((await token.balanceOf(addresses[0])).toString()).to.equal(
  //     "949460820000000000000000000"
  //   );
  //
  //   await token.transfer(
  //     stakingPlatform.address,
  //     "120000000000000000000000000"
  //   );
  //
  //   await stakingPlatform.withdrawResidualBalance();
  //
  //   expect(
  //     (await token.balanceOf(stakingPlatform.address)).toString()
  //   ).to.equal("0");
  //   expect((await token.balanceOf(addresses[0])).toString()).to.equal(
  //     "999349738268033059900000000"
  //   );
  // });
  //
  // it("Should fail withdraw residual if nothing to withdraw after increasing 1000days", async () => {
  //   await increaseTime(1000 * 24 * 60 * 60);
  //   await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
  //     "No residual Balance to withdraw"
  //   );
  // });
  //
  // it("Should return the amount staked once staking finished and withdrew", async () => {
  //   for (let i = 1; i <= 8; i++) {
  //     expect(
  //       (await stakingPlatform.connect(accounts[i]).amountStaked()).toString()
  //     ).to.equal("0");
  //   }
  // });
  //
  // it("Should fail deposit after staking ended", async () => {
  //   await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
  //   await expect(
  //     stakingPlatform.connect(accounts[1]).deposit("1000")
  //   ).to.be.revertedWith("Staking period ended");
  // });
  //
  // it("Should return the amount staked", async () => {
  //   expect(await stakingPlatform.totalDeposited()).to.equal(n18("0"));
  // });
});
