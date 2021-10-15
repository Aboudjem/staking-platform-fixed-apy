const { n18, increaseTime } = require("./helpers");
const { expect } = require("chai");

describe("StakingPlatform", () => {
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

    await token.transfer(addresses[8], n18("100000"));
    expect((await token.balanceOf(addresses[8])).toString()).to.equal(
      "100000000000000000000000"
    );
  });

  it("Should deploy the new staking platform", async () => {
    const StakingPlatform = await ethers.getContractFactory(
      "StakingPlatformTester"
    );
    stakingPlatform = await StakingPlatform.deploy(
      token.address,
      9,
      365,
      180,
      n18("45000000")
    );
    await stakingPlatform.deployed();
  });

  it("Shoud increase precision", async () => {
    await stakingPlatform.setPrecision(28);
  });

  it("Should send tokens to staking platform", async () => {
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18("0"));
    await token.transfer(stakingPlatform.address, n18("4050000"));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(
      n18("4050000")
    );
  });

  it("Should deposit to staking platform", async () => {
    for (let i = 1; i <= 8; i++) {
      const balance = await token.balanceOf(addresses[i]);
      await token
        .connect(accounts[i])
        .approve(stakingPlatform.address, balance);
      await stakingPlatform.connect(accounts[i]).deposit(balance);
      expect((await token.balanceOf(addresses[i])).toString()).to.equal("0");
    }
  });

  it("Should return the amount staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("2482000"));
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
    ).to.equal("27397577371892440385591070");

    const user1 = (
      await stakingPlatform.connect(accounts[1]).calculatedReward()
    ).toString();
    expect(user1).to.equal("24657819634703196347");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "24658105022831050228"
    );
    expect(
      (await stakingPlatform.connect(accounts[1]).calculatedReward()).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.connect(accounts[2]).calculatedReward()
    ).toString();
    expect(user2).to.equal("86303367579908675799");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "86304366438356164383"
    );
    expect(
      (await stakingPlatform.connect(accounts[2]).calculatedReward()).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.connect(accounts[3]).calculatedReward()
    ).toString();
    expect(user3).to.equal("9123604452054794520");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9123710045662100456"
    );
    expect(
      (await stakingPlatform.connect(accounts[3]).calculatedReward()).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.connect(accounts[4]).calculatedReward()
    ).toString();
    expect(user4).to.equal("493173515981735159");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "493179223744292237"
    );
    expect(
      (await stakingPlatform.connect(accounts[4]).calculatedReward()).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.connect(accounts[5]).calculatedReward()
    ).toString();
    expect(user5).to.equal("456190781963470319634");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "456196061643835616438"
    );
    expect(
      (await stakingPlatform.connect(accounts[5]).calculatedReward()).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.connect(accounts[6]).calculatedReward()
    ).toString();
    expect(user6).to.equal("8137551369863013698");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8137645547945205479"
    );
    expect(
      (await stakingPlatform.connect(accounts[6]).calculatedReward()).toString()
    ).to.equal("0");
  });

  it("Should claim and restake", async () => {
    await stakingPlatform.connect(accounts[8]).claimRewards();
    const balanceOfUser8 = await token.balanceOf(addresses[8]);
    await token
      .connect(accounts[8])
      .approve(stakingPlatform.address, balanceOfUser8);
    await stakingPlatform.connect(accounts[8]).deposit(balanceOfUser8);
  });

  it("Should revert if exceed the max staking amount", async () => {
    await token.approve(stakingPlatform.address, n18("50000000"));
    await expect(stakingPlatform.deposit(n18("50000000"))).to.revertedWith(
      "Amount staked exceeds MaxStake"
    );
  });

  it("Should deposit 100 000 tokens", async () => {
    await token.approve(stakingPlatform.address, n18("100000"));
    await stakingPlatform.deposit(n18("100000"));
  });

  it("Should deposit 900 000 tokens", async () => {
    await token.approve(stakingPlatform.address, n18("900000"));
    await stakingPlatform.deposit(n18("900000"));
  });

  it("Should fail deposit tokens", async () => {
    await expect(stakingPlatform.deposit(n18("100000"))).to.revertedWith(
      "ERC20: transfer amount exceeds allowance"
    );
  });

  it("Should fail withdraw tokens before ending period", async () => {
    await expect(stakingPlatform.withdraw()).to.revertedWith(
      "Withdrawal unable before ending"
    );
  });

  it("Should withdraw tokens after lockup period", async () => {
    const userBalance = (await token.balanceOf(addresses[7])).toString();
    expect(userBalance).to.equal("0");

    const userRewards = (
      await stakingPlatform.rewardOf(addresses[7])
    ).toString();
    expect(userRewards).to.equal("2466181506849315068");
    await expect(
      stakingPlatform.connect(accounts[7]).withdraw()
    ).to.revertedWith("Withdrawal unable before ending");
  });

  it("Should withdraw tokens after lockup period", async () => {
    await increaseTime(180 * 60 * 60 * 24);

    userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();
    expect(userRewards).to.equal("446301826484018264840");

    await stakingPlatform.connect(accounts[7]).withdraw();

    userBalance = (await token.balanceOf(addresses[7])).toString();
    userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();

    expect(userBalance).to.equal("10446301855022831050228");
    expect(userRewards).to.equal("0");
  });

  it("Should return the amount staked after 185 day (total 366 passed days)", async () => {
    await increaseTime(184 * 60 * 60 * 24);

    let user7Balance = (await token.balanceOf(addresses[7])).toString();
    expect(user7Balance).to.equal("10446301855022831050228");

    let user7rewards = (
      await stakingPlatform.rewardOf(addresses[7])
    ).toString();
    expect(user7rewards).to.equal("0");

    await stakingPlatform.connect(accounts[7]).withdraw();
    user7Balance = (await token.balanceOf(addresses[7])).toString();

    expect(user7Balance).to.equal("10446301855022831050228");

    user7rewards = (await stakingPlatform.rewardOf(addresses[7])).toString();
    expect(user7rewards).to.equal("0");

    const user1 = (
      await stakingPlatform.connect(accounts[1]).calculatedReward()
    ).toString();
    expect(user1).to.equal("8975341894977168949772");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "24658105022831050228"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "9000000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[1]).calculatedReward()).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.connect(accounts[2]).calculatedReward()
    ).toString();
    expect(user2).to.equal("31413695633561643835617");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "86304366438356164383"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "31500000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[2]).calculatedReward()).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.connect(accounts[3]).calculatedReward()
    ).toString();
    expect(user3).to.equal("3320876289954337899544");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9123710045662100456"
    );
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "3330000000000000000000"
    );

    expect(
      (await stakingPlatform.connect(accounts[3]).calculatedReward()).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.connect(accounts[4]).calculatedReward()
    ).toString();
    expect(user4).to.equal("179506820776255707763");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "493179223744292237"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "180000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[4]).calculatedReward()).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.connect(accounts[5]).calculatedReward()
    ).toString();
    expect(user5).to.equal("166043803938356164383562");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "456196061643835616438"
    );
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "166500000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[5]).calculatedReward()).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.connect(accounts[6]).calculatedReward()
    ).toString();
    expect(user6).to.equal("2961862354452054794521");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8137645547945205479"
    );
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "2970000000000000000000"
    );
    expect(
      (await stakingPlatform.connect(accounts[6]).calculatedReward()).toString()
    ).to.equal("0");
  });

  it("Should withdraw initial deposit", async () => {
    await stakingPlatform.setPrecision(8);

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "9000000000000000000000"
    );

    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "31500000000000000000000"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "3330000000000000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "180000000000000000000"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "166500000000000000000000"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "2970000000000000000000"
    );
    for (let i = 0; i <= 8; i++) {
      await stakingPlatform.connect(accounts[i]).withdraw();
    }

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "109000000000000000000000"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "381500000000000000000000"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "40330000000000000000000"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2180000000000000000000"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2016500000000000000000000"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "35970000000000000000000"
    );
  });

  it("Should return the amount staked once staking finished and withdrew", async () => {
    for (let i = 1; i <= 8; i++) {
      expect(
        (await stakingPlatform.connect(accounts[1]).amountStaked()).toString()
      ).to.equal("0");
    }
  });

  it("Should fail deposit after staking ended", async () => {
    await token.connect(accounts[1]).approve(stakingPlatform.address, "1000");
    await expect(
      stakingPlatform.connect(accounts[1]).deposit("1000")
    ).to.be.revertedWith("Staking period ended");
  });

  it("Should return the amount staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("0"));
  });

  it("Should return the rewarded staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("0"));
  });
});
