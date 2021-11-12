const { n18, increaseTime, UINT_MAX, ONE_DAY } = require("../helpers");
const { expect } = require("chai");

describe("StakingPlatform - Pool - withdrawal with amount", () => {
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
      365,
      n18("20000000")
    );
    await stakingPlatform.deployed();
  });

  it("Should set precision to 2", async () => {
    await stakingPlatform.setPrecision(4);
  });

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

  it("Should withdraw tokens before staking starts", async () => {
    await increaseTime(ONE_DAY * 365);
    expect((await stakingPlatform.rewardOf(addresses[1])).toString()).to.equal(
      "0"
    );
    expect((await stakingPlatform.rewardOf(addresses[2])).toString()).to.equal(
      "0"
    );
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform
      .connect(accounts[1])
      .withdraw(await stakingPlatform.amountStaked(addresses[1]));
    await stakingPlatform
      .connect(accounts[2])
      .withdraw(await stakingPlatform.amountStaked(addresses[2]));
    expect((await stakingPlatform.rewardOf(addresses[1])).toString()).to.equal(
      "0"
    );
    expect((await stakingPlatform.rewardOf(addresses[2])).toString()).to.equal(
      "0"
    );
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "100000000000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "200000000000000000000000"
    );
  });

  it("Should re-deposit to staking platform for user1 and user2", async () => {
    const balance1 = await token.balanceOf(addresses[1]);
    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[1]).deposit(balance1);
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");

    const balance2 = await token.balanceOf(addresses[2]);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[2]).deposit(balance2);
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
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
    expect(
      (await stakingPlatform.percentageTimeRemaining(addresses[1])).toString()
    ).to.equal("27");

    const user1 = (
      await stakingPlatform.calculatedReward(addresses[1])
    ).toString();

    expect(user1).to.equal("27000000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "27000000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("54000000000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "54000000000000000000"
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
    expect(user1).to.equal("27000000000000000000");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "27000000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "54000000000000000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("54000000000000000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "54000000000000000000"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "108000000000000000000"
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

    expect(user1).to.equal("273000000000000000000");
    expect(user2).to.equal("546000000000000000000");

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "54000000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "108000000000000000000"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "327000000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "654000000000000000000"
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
  });

  it("Should return the amount staked after increasing staked for 10days (22days passed)", async () => {
    let user1;
    let user2;

    for (let i = 0; i < 10; i++) {
      await increaseTime(60 * 60 * 24);

      user1 = await stakingPlatform.rewardOf(addresses[1]);
      user2 = await stakingPlatform.rewardOf(addresses[2]);
    }

    expect(user1).to.equal("273892710000000000000");
    expect(user2).to.equal("547785420000000000000");

    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");

    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "273892710000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "547785420000000000000"
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
  });

  it("Should deposit balance for user3 & user4 (122days passed)", async () => {
    await increaseTime(100 * 60 * 60 * 24);

    const balance1 = await token.balanceOf(addresses[3]);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[3]).deposit(balance1);
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");

    const balance4 = await token.balanceOf(addresses[4]);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
  });

  it("Should return the amount staked after 10 days (132days passed)", async () => {
    let user3;
    let user4;

    for (let i = 0; i < 10; i++) {
      await increaseTime(60 * 60 * 24);

      user3 = (await stakingPlatform.calculatedReward(addresses[3])).toString();
      user4 = (await stakingPlatform.calculatedReward(addresses[4])).toString();
    }

    expect(user3).to.equal("273000000000000000000");
    expect(user4).to.equal("546000000000000000000");

    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[3]).claimRewards();
    await stakingPlatform.connect(accounts[4]).claimRewards();

    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "273000000000000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "546000000000000000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");
  });

  it("Should deposit balance for user1 & user2", async () => {
    const balance3 = await token.balanceOf(addresses[3]);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[3]).deposit(balance3);
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");

    const balance4 = await token.balanceOf(addresses[4]);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
  });

  it("Should return the amount staked after 10 days (142 days passed)", async () => {
    let user3;
    let user4;

    for (let i = 0; i < 10; i++) {
      await increaseTime(60 * 60 * 24);

      user3 = (await stakingPlatform.calculatedReward(addresses[3])).toString();
      user4 = (await stakingPlatform.calculatedReward(addresses[4])).toString();
    }

    expect(user3).to.equal("273745290000000000000");
    expect(user4).to.equal("547490580000000000000");

    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[3]).claimRewards();
    await stakingPlatform.connect(accounts[4]).claimRewards();

    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "273745290000000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "547490580000000000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");
  });

  it("Should return the amount of rewards for a specific user after 1 day (143days passed)", async () => {
    const user3RewardsBefore = (
      await stakingPlatform.rewardOf(addresses[3])
    ).toString();
    expect(user3RewardsBefore).to.equal("0");

    await increaseTime(60 * 60 * 24);

    const user3RewardsAfter = (
      await stakingPlatform.rewardOf(addresses[3])
    ).toString();
    expect(user3RewardsAfter).to.equal("27073710000000000000");
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

  it("Should fail claiming tokens (144 days passed)", async () => {
    await increaseTime(60 * 60 * 24);

    await expect(stakingPlatform.claimRewards());
    await expect(stakingPlatform.claimRewards()).to.revertedWith(
      "Nothing to claim"
    );
  });

  it("Should not withdraw tokens after 200days lockup still active (344 days passed)", async () => {
    await increaseTime(200 * 60 * 60 * 24);

    await expect(
      stakingPlatform
        .connect(accounts[7])
        .withdraw(await stakingPlatform.amountStaked(addresses[7]))
    ).to.revertedWith("No withdraw until lockup ends");
  });

  it("Should deposit to staking platform for user3 and user4", async () => {
    const balance3 = await token.balanceOf(addresses[3]);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[3]).deposit(balance3);
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");

    const balance4 = await token.balanceOf(addresses[4]);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
  });

  it("Should return the total amount staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(
      "1603442914000000000000000"
    );
  });

  it("Should return and claim rewards staked after 1 day (345 days passed)", async () => {
    await stakingPlatform.connect(accounts[3]).claimRewards();
    await stakingPlatform.connect(accounts[4]).claimRewards();
    const user3Before = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();

    const user4Before = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();

    expect(user3Before).to.equal("0");
    expect(user4Before).to.equal("0");

    await increaseTime(60 * 60 * 24);

    const user3 = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();
    expect(user3).to.equal("27147621228300000000");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "5549107820000000000000"
    );
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "5576255441228300000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();
    expect(user4).to.equal("54295242456600000000");

    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "11098215640000000000000"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "11152510882456600000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");
  });

  it("Should withdraw tokens after ending period (845days passed)", async () => {
    await increaseTime(500 * 60 * 60 * 24);

    let userRewards = (await stakingPlatform.rewardOf(addresses[1])).toString();
    expect(userRewards).to.equal("9453465887958700000000");

    await stakingPlatform
      .connect(accounts[1])
      .withdraw(await stakingPlatform.amountStaked(addresses[1]));

    const userBalance = (await token.balanceOf(addresses[1])).toString();
    userRewards = (await stakingPlatform.rewardOf(addresses[1])).toString();

    expect(userBalance).to.equal("110054358597958700000000");
    expect(userRewards).to.equal("0");
  });

  it("Should withdraw tokens after ending period", async () => {
    await increaseTime(200 * 60 * 60 * 24);

    let userRewards = (await stakingPlatform.rewardOf(addresses[3])).toString();
    expect(userRewards).to.equal("549990696736300000000");

    await stakingPlatform
      .connect(accounts[3])
      .withdraw(await stakingPlatform.amountStaked(addresses[3]));

    const userBalance = (await token.balanceOf(addresses[3])).toString();
    userRewards = (await stakingPlatform.rewardOf(addresses[3])).toString();

    expect(userBalance).to.equal("106672991427964600000000");
    expect(userRewards).to.equal("0");
  });

  it("Should return the amount staked after 1000 days", async () => {
    await increaseTime(1000 * 60 * 60 * 24);

    const user1 = (
      await stakingPlatform.calculatedReward(addresses[1])
    ).toString();
    expect(user1).to.equal("0");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "110054358597958700000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();
    expect(user3).to.equal("0");

    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "106672991427964600000000"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("18906931775917400000000");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "18906931775917400000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();
    expect(user4).to.equal("1099981393472600000000");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "11152510882456600000000"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "12252492275929200000000"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");
  });

  it("Should withdraw initial deposit", async () => {
    for (let i = 0; i <= 8; i++) {
      // eslint-disable-next-line eqeqeq
      if ((await stakingPlatform.amountStaked(addresses[i])) != 0) {
        await stakingPlatform
          .connect(accounts[i])
          .withdraw(await stakingPlatform.amountStaked(addresses[i]));
      }
    }

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "110054358597958700000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "220108717195917400000000"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "106672991427964600000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "213345982855929200000000"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal("0");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal("0");
  });

  it("Should withdraw residual balances", async () => {
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("49889007949922230100000000");
    expect((await token.balanceOf(addresses[0])).toString()).to.equal(
      "949460810000000000000000000"
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
      "999349817949922230100000000"
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
