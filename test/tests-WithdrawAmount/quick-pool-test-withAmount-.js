const { n18, increaseTime, UINT_MAX } = require("../helpers");
const { expect } = require("chai");

describe("StakingPlatform - Quick Pool - withdrawal with amount", () => {
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
    expect(user1).to.equal("24657819634703196347");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "24658105022831050228"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("86303367579908675799");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "86304366438356164383"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();
    expect(user3).to.equal("9123604452054794520");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9123710045662100456"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();
    expect(user4).to.equal("493173515981735159");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "493179223744292237"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.calculatedReward(addresses[5])
    ).toString();
    expect(user5).to.equal("456190781963470319634");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "456196061643835616438"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[5])).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.calculatedReward(addresses[6])
    ).toString();
    expect(user6).to.equal("8137551369863013698");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal("0");
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8137645547945205479"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[6])).toString()
    ).to.equal("0");
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
    await token.approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.deposit(n18("900000"));
  });

  it("Should fail deposit tokens", async () => {
    await token.approve(stakingPlatform.address, n18("9000"));
    await expect(stakingPlatform.deposit(n18("100000"))).to.revertedWith(
      "ERC20: transfer amount exceeds allowance"
    );
  });

  it("Should fail withdraw tokens before ending period", async () => {
    await expect(stakingPlatform.withdrawAll()).to.revertedWith(
      "No withdraw until lockup ends"
    );
  });

  it("Should withdraw tokens after lockup period", async () => {
    const userBalance = (await token.balanceOf(addresses[7])).toString();
    expect(userBalance).to.equal("0");

    const userRewards = (
      await stakingPlatform.rewardOf(addresses[7])
    ).toString();
    expect(userRewards).to.equal("2466210045662100456");
    await expect(
      stakingPlatform
        .connect(accounts[7])
        .withdraw(await stakingPlatform.amountStaked(addresses[7]))
    ).to.revertedWith("No withdraw until lockup ends");
  });

  it("Should withdraw tokens after lockup period", async () => {
    await increaseTime(180 * 60 * 60 * 24);

    let userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();
    expect(userRewards).to.equal("446301855022831050228");

    await stakingPlatform
      .connect(accounts[7])
      .withdraw(await stakingPlatform.amountStaked(addresses[7]));

    const userBalance = (await token.balanceOf(addresses[7])).toString();
    userRewards = (await stakingPlatform.rewardOf(addresses[7])).toString();

    expect(userBalance).to.equal("10446301883561643835616");
    expect(userRewards).to.equal("0");
  });

  it("Should return the amount staked after 185 days (total 366 passed days)", async () => {
    await increaseTime(184 * 60 * 60 * 24);

    let user7Balance = (await token.balanceOf(addresses[7])).toString();
    expect(user7Balance).to.equal("10446301883561643835616");

    let user7rewards = (
      await stakingPlatform.rewardOf(addresses[7])
    ).toString();
    expect(user7rewards).to.equal("0");

    await expect(
      stakingPlatform
        .connect(accounts[7])
        .withdraw(await stakingPlatform.amountStaked(addresses[7]))
    ).to.be.revertedWith("Amount must be greater than 0");

    user7Balance = (await token.balanceOf(addresses[7])).toString();

    expect(user7Balance).to.equal("10446301883561643835616");

    user7rewards = (await stakingPlatform.rewardOf(addresses[7])).toString();
    expect(user7rewards).to.equal("0");

    const user1 = (
      await stakingPlatform.calculatedReward(addresses[1])
    ).toString();
    expect(user1).to.equal("8975341894977168949771");
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "24658105022831050228"
    );
    await stakingPlatform.connect(accounts[1]).claimRewards();
    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "8999999999999999999999"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[1])).toString()
    ).to.equal("0");

    const user2 = (
      await stakingPlatform.calculatedReward(addresses[2])
    ).toString();
    expect(user2).to.equal("31413695633561643835616");
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "86304366438356164383"
    );
    await stakingPlatform.connect(accounts[2]).claimRewards();
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "31499999999999999999999"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[2])).toString()
    ).to.equal("0");

    const user3 = (
      await stakingPlatform.calculatedReward(addresses[3])
    ).toString();
    expect(user3).to.equal("3320876289954337899543");
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "9123710045662100456"
    );
    await stakingPlatform.connect(accounts[3]).claimRewards();
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "3329999999999999999999"
    );

    expect(
      (await stakingPlatform.calculatedReward(addresses[3])).toString()
    ).to.equal("0");

    const user4 = (
      await stakingPlatform.calculatedReward(addresses[4])
    ).toString();
    expect(user4).to.equal("179506820776255707762");
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "493179223744292237"
    );
    await stakingPlatform.connect(accounts[4]).claimRewards();
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "179999999999999999999"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[4])).toString()
    ).to.equal("0");

    const user5 = (
      await stakingPlatform.calculatedReward(addresses[5])
    ).toString();
    expect(user5).to.equal("166043803938356164383561");
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "456196061643835616438"
    );
    await stakingPlatform.connect(accounts[5]).claimRewards();
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "166499999999999999999999"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[5])).toString()
    ).to.equal("0");

    const user6 = (
      await stakingPlatform.calculatedReward(addresses[6])
    ).toString();
    expect(user6).to.equal("2961862354452054794520");
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "8137645547945205479"
    );
    await stakingPlatform.connect(accounts[6]).claimRewards();
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "2969999999999999999999"
    );
    expect(
      (await stakingPlatform.calculatedReward(addresses[6])).toString()
    ).to.equal("0");
  });

  it("Should withdraw initial deposit", async () => {
    await stakingPlatform.setPrecision(8);

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "8999999999999999999999"
    );

    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "31499999999999999999999"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "3329999999999999999999"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "179999999999999999999"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "166499999999999999999999"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "2969999999999999999999"
    );
    for (let i = 0; i <= 8; i++) {
      // eslint-disable-next-line eqeqeq
      if ((await stakingPlatform.amountStaked(addresses[i])) != 0) {
        await stakingPlatform
          .connect(accounts[i])
          .withdraw(await stakingPlatform.amountStaked(addresses[i]));
      }
    }

    expect((await token.balanceOf(addresses[1])).toString()).to.equal(
      "108999999999999999999999"
    );
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "381499999999999999999999"
    );
    expect((await token.balanceOf(addresses[3])).toString()).to.equal(
      "40329999999999999999999"
    );
    expect((await token.balanceOf(addresses[4])).toString()).to.equal(
      "2179999999999999999999"
    );
    expect((await token.balanceOf(addresses[5])).toString()).to.equal(
      "2016499999999999999999999"
    );
    expect((await token.balanceOf(addresses[6])).toString()).to.equal(
      "35969999999999999999999"
    );
  });

  it("Should return the amount staked once staking finished and withdrew", async () => {
    for (let i = 0; i <= 8; i++) {
      expect(
        (await stakingPlatform.amountStaked(addresses[i])).toString()
      ).to.equal("0");
    }
  });

  it("Should not withdraw residual balances before endingperiod + 1 year", async () => {
    await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
      "Withdraw 1year after endPeriod"
    );
  });

  it("Should withdraw residual balances", async () => {
    // increase time by 1 year
    await increaseTime(365 * 60 * 60 * 24);
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("3746320310145662100456628");
    expect((await token.balanceOf(addresses[0])).toString()).to.equal(
      "993657753387970776255707762"
    );

    await stakingPlatform.withdrawResidualBalance();

    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("0");
    expect((await token.balanceOf(addresses[0])).toString()).to.equal(
      "997404073698116438356164390"
    );
  });

  it("Should fail withdraw residual if nothing to withdraw", async () => {
    await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
      "No residual Balance to withdraw"
    );
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
});
