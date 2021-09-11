const { n18, increaseTime } = require("./helpers");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Token", () => {
  let token;
  let stakingPlatform;
  let accounts;
  let addresses;

  it("Should deploy the new TreebToken", async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(n18("1000000000"));
    await token.deployed();
    accounts = await ethers.getSigners();
    addresses = accounts.map((account) => account.address);
    console.log("->", addresses);
  });

  it("should distribute tokens among users", async () => {
    console.log((await token.balanceOf(addresses[1])).toString());
    await token.transfer(addresses[1], n18("100000"));
    console.log((await token.balanceOf(addresses[1])).toString());

    console.log((await token.balanceOf(addresses[2])).toString());
    await token.transfer(addresses[2], n18("350000"));
    console.log((await token.balanceOf(addresses[2])).toString());

    console.log((await token.balanceOf(addresses[3])).toString());
    await token.transfer(addresses[3], n18("37000"));
    console.log((await token.balanceOf(addresses[3])).toString());

    console.log((await token.balanceOf(addresses[4])).toString());
    await token.transfer(addresses[4], n18("2000"));
    console.log((await token.balanceOf(addresses[4])).toString());

    console.log((await token.balanceOf(addresses[5])).toString());
    await token.transfer(addresses[5], n18("1850000"));
    console.log((await token.balanceOf(addresses[5])).toString());

    console.log((await token.balanceOf(addresses[6])).toString());
    await token.transfer(addresses[6], n18("33000"));
    console.log((await token.balanceOf(addresses[6])).toString());
  });

  it("Should deploy the new staking platform", async () => {
    const StakingPlatform = await ethers.getContractFactory("Tester");
    stakingPlatform = await StakingPlatform.deploy(
      token.address,
      365,
      n18("5000000"),
      25
    );
    await stakingPlatform.deployed();
  });

  it("Should send Treeb to staking platform", async () => {
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18("0"));
    await token.transfer(stakingPlatform.address, n18("5000000"));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(
      n18("5000000")
    );
  });

  it("Should deposit to staking platform", async () => {
    for (let i = 1; i <= 6; i++) {
      const balance = await token.balanceOf(addresses[i]);
      console.log(balance.toString());
      await token
        .connect(accounts[i])
        .approve(stakingPlatform.address, balance);
      await stakingPlatform.connect(accounts[i]).deposit(balance);
    }
  });

  it("Should return the amount staked", async () => {
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("2372000"));
  });

  it("Should start Staking and ending period should last 1 year", async () => {
    expect((await stakingPlatform.start()).toString()).to.equal("0");
    await stakingPlatform.startStaking();
    expect((await stakingPlatform.start()).toString()).to.not.equal("0");
    expect(
      (
        (await stakingPlatform.end()) - (await stakingPlatform.start())
      ).toString()
    ).to.equal("31536000");
  });

  it("Should fail if trying to start Staking twice", async () => {
    await expect(stakingPlatform.startStaking()).to.revertedWith(
      "Staking: Staking already started"
    );
  });

  it("Should return the amount staked", async () => {
    console.log(
      (await stakingPlatform.connect(accounts[1]).amountStaked()).toString()
    );
  });

  it("Should return and claim rewards staked after 1 day", async () => {
    await increaseTime(60 * 60 * 24);
    console.log((await stakingPlatform.percentageTimeRemaining()).toString());

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
    console.log((await stakingPlatform.percentageTimeRemaining()).toString());

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

  it("Should revert if exceed the max staking amount", async () => {
    await token.approve(stakingPlatform.address, n18("50000000"));
    await expect(stakingPlatform.deposit(n18("50000000"))).to.revertedWith(
      "Deposit: Amount staked exceeds MaxStake"
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
      "Lockup: Cannot withdraw until the end of the period"
    );
  });

  it("Should fail claiming tokens", async () => {
    await expect(stakingPlatform.claimRewards());
    await expect(stakingPlatform.claimRewards()).to.revertedWith(
      "Nothing to claim"
    );
  });

  it("Should return the amount staked after 1000 day", async () => {
    await increaseTime(1000 * 60 * 60 * 24);
    console.log((await stakingPlatform.percentageTimeRemaining()).toString());

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

    console.log(
      utils
        .formatEther(await token.balanceOf(stakingPlatform.address))
        .toString()
    );
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
    for (let i = 1; i <= 6; i++) {
      await stakingPlatform.connect(accounts[i]).withdraw();
      console.log(
        utils
          .formatEther(await token.balanceOf(stakingPlatform.address))
          .toString()
      );
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

  it("Should return the amount staked once staking finished and withdrew", async () => {
    for (let i = 1; i <= 6; i++) {
      expect(
        (await stakingPlatform.connect(accounts[1]).amountStaked()).toString()
      ).to.equal("0");
    }
  });

  it("Should fail deposit after staking ended", async () => {
    await token.connect(accounts[1]).approve(stakingPlatform.address, "1000");
    await expect(
      stakingPlatform.connect(accounts[1]).deposit("1000")
    ).to.be.revertedWith("Deposit: Cannot deposit after the end of the period");
  });
});
