const { n18, increaseTime, UINT_MAX, ONE_DAY } = require("../helpers");
const { expect } = require("chai");

describe("StakingPlatform - Withdraw Amount - withdrawal with amount", () => {
  let token;
  let stakingPlatform;
  let accounts;
  let addresses;

  before(async () => {
    accounts = await ethers.getSigners();
    addresses = accounts.map((account) => account.address);
  });

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(n18("1000000000"));
    await token.deployed();

    await token.transfer(addresses[1], n18("100000"));
    await token.transfer(addresses[2], n18("100000"));
    await token.transfer(addresses[3], n18("100000"));
    await token.transfer(addresses[4], n18("100000"));

    const StakingPlatform = await ethers.getContractFactory(
      "StakingPlatformTester"
    );
    stakingPlatform = await StakingPlatform.deploy(
      token.address,
      10,
      100,
      50,
      n18("20000000")
    );
    await stakingPlatform.deployed();

    await token.transfer(stakingPlatform.address, n18("50000000"));

    const balance1 = await token.balanceOf(addresses[1]);
    const balance2 = await token.balanceOf(addresses[2]);
    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);

    await ethers.provider.send("evm_setAutomine", [false]);
    await stakingPlatform.connect(accounts[1]).deposit(balance1);
    await stakingPlatform.startStaking();
    await ethers.provider.send("evm_setAutomine", [true]);
    await stakingPlatform.connect(accounts[2]).deposit(balance2);
  });

  it("Should return rewards at start", async () => {
    const user1 = await stakingPlatform.rewardOf(addresses[1]);
    const user2 = await stakingPlatform.rewardOf(addresses[2]);
    const user3 = await stakingPlatform.rewardOf(addresses[3]);
    const user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("0");
    expect(user2.toString()).to.equal("0");
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");
  });

  it("Should return rewards after one day", async () => {
    await increaseTime(ONE_DAY);
    const user1 = await stakingPlatform.rewardOf(addresses[1]);
    const user2 = await stakingPlatform.rewardOf(addresses[2]);
    const user3 = await stakingPlatform.rewardOf(addresses[3]);
    const user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal(n18("100"));
    expect(user2.toString()).to.equal(n18("100"));
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");
  });

  it("Should return rewards after 50 days", async () => {
    await increaseTime(ONE_DAY * 50);
    const user1 = await stakingPlatform.rewardOf(addresses[1]);
    const user2 = await stakingPlatform.rewardOf(addresses[2]);
    const user3 = await stakingPlatform.rewardOf(addresses[3]);
    const user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal(n18("5000"));
    expect(user2.toString()).to.equal(n18("5000"));
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");
  });

  it("Should return rewards after 100 days", async () => {
    await increaseTime(ONE_DAY * 100);
    const user1 = await stakingPlatform.rewardOf(addresses[1]);
    const user2 = await stakingPlatform.rewardOf(addresses[2]);
    const user3 = await stakingPlatform.rewardOf(addresses[3]);
    const user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal(n18("10000"));
    expect(user2.toString()).to.equal(n18("10000"));
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");
  });

  it("Should withdraw after 50 days", async () => {
    await increaseTime(ONE_DAY * 50);

    const balance1Before = await token.balanceOf(addresses[1]);
    const balance2Before = await token.balanceOf(addresses[2]);
    const stakedAmount1Before = await stakingPlatform.amountStaked(
      addresses[1]
    );
    const stakedAmount2Before = await stakingPlatform.amountStaked(
      addresses[2]
    );
    expect(balance1Before).to.equal(n18("0"));
    expect(balance2Before).to.equal(n18("0"));
    expect(stakedAmount1Before).to.equal(n18("100000"));
    expect(stakedAmount2Before).to.equal(n18("100000"));

    await stakingPlatform.connect(accounts[1]).withdraw(n18("40000"));
    await stakingPlatform.connect(accounts[2]).withdraw(n18("40000"));

    const stakedAmount1After = await stakingPlatform.amountStaked(addresses[1]);
    const stakedAmount2After = await stakingPlatform.amountStaked(addresses[2]);

    expect(stakedAmount1After).to.equal(n18("60000"));
    expect(stakedAmount2After).to.equal(n18("60000"));
  });

  it("Should fail withdraw 0 after 50 days", async () => {
    await increaseTime(ONE_DAY * 50);

    const balance1Before = await token.balanceOf(addresses[1]);
    const balance2Before = await token.balanceOf(addresses[2]);
    const stakedAmount1Before = await stakingPlatform.amountStaked(
      addresses[1]
    );
    const stakedAmount2Before = await stakingPlatform.amountStaked(
      addresses[2]
    );
    expect(balance1Before).to.equal(n18("0"));
    expect(balance2Before).to.equal(n18("0"));
    expect(stakedAmount1Before).to.equal(n18("100000"));
    expect(stakedAmount2Before).to.equal(n18("100000"));

    await expect(
      stakingPlatform.connect(accounts[1]).withdraw(n18("0"))
    ).to.be.revertedWith("Amount must be greater than 0");

    await expect(
      stakingPlatform.connect(accounts[2]).withdraw(n18("0"))
    ).to.be.revertedWith("Amount must be greater than 0");

    const stakedAmount1After = await stakingPlatform.amountStaked(addresses[1]);
    const stakedAmount2After = await stakingPlatform.amountStaked(addresses[2]);

    expect(stakedAmount1After).to.equal(n18("100000"));
    expect(stakedAmount2After).to.equal(n18("100000"));
  });

  it("Should fail withdraw more than stakedAmount after 50 days", async () => {
    await increaseTime(ONE_DAY * 50);

    const balance1Before = await token.balanceOf(addresses[1]);
    const balance2Before = await token.balanceOf(addresses[2]);
    const stakedAmount1Before = await stakingPlatform.amountStaked(
      addresses[1]
    );
    const stakedAmount2Before = await stakingPlatform.amountStaked(
      addresses[2]
    );
    expect(balance1Before).to.equal(n18("0"));
    expect(balance2Before).to.equal(n18("0"));
    expect(stakedAmount1Before).to.equal(n18("100000"));
    expect(stakedAmount2Before).to.equal(n18("100000"));

    await expect(
      stakingPlatform.connect(accounts[1]).withdraw(n18("100001"))
    ).to.be.revertedWith("Amount higher than stakedAmount");

    await expect(
      stakingPlatform.connect(accounts[2]).withdraw(n18("100001"))
    ).to.be.revertedWith("Amount higher than stakedAmount");

    const stakedAmount1After = await stakingPlatform.amountStaked(addresses[1]);
    const stakedAmount2After = await stakingPlatform.amountStaked(addresses[2]);

    expect(stakedAmount1After).to.equal(n18("100000"));
    expect(stakedAmount2After).to.equal(n18("100000"));
  });

  it("Should withdraw 90% after 50 days and returns rewards after endPeriod", async () => {
    await increaseTime(ONE_DAY * 50);

    const balance1Before = await token.balanceOf(addresses[1]);
    const balance2Before = await token.balanceOf(addresses[2]);
    const stakedAmount1Before = await stakingPlatform.amountStaked(
      addresses[1]
    );
    const stakedAmount2Before = await stakingPlatform.amountStaked(
      addresses[2]
    );
    expect(balance1Before).to.equal(n18("0"));
    expect(balance2Before).to.equal(n18("0"));
    expect(stakedAmount1Before).to.equal(n18("100000"));
    expect(stakedAmount2Before).to.equal(n18("100000"));

    let user1Rewards = await stakingPlatform.rewardOf(addresses[1]);
    let user2Rewards = await stakingPlatform.rewardOf(addresses[2]);
    expect(user1Rewards.toString()).to.equal(n18("5000"));
    expect(user2Rewards.toString()).to.equal(n18("5000"));

    await stakingPlatform.connect(accounts[1]).withdraw(n18("90000"));
    await stakingPlatform.connect(accounts[2]).withdraw(n18("99000"));

    const balance1After = await token.balanceOf(addresses[1]);
    const balance2After = await token.balanceOf(addresses[2]);
    const stakedAmount1After = await stakingPlatform.amountStaked(addresses[1]);
    const stakedAmount2After = await stakingPlatform.amountStaked(addresses[2]);

    expect(balance1After).to.equal(user1Rewards.add(n18("90000")));
    expect(balance2After).to.equal(user2Rewards.add(n18("99000")));

    expect(stakedAmount1After).to.equal(n18("10000"));
    expect(stakedAmount2After).to.equal(n18("1000"));

    user1Rewards = await stakingPlatform.rewardOf(addresses[1]);
    user2Rewards = await stakingPlatform.rewardOf(addresses[2]);
    expect(user1Rewards.toString()).to.equal(n18("0"));
    expect(user2Rewards.toString()).to.equal(n18("0"));

    await increaseTime(ONE_DAY * 55);

    user1Rewards = await stakingPlatform.rewardOf(addresses[1]);
    user2Rewards = await stakingPlatform.rewardOf(addresses[2]);
    expect(user1Rewards.toString()).to.equal(n18("499.999"));
    expect(user2Rewards.toString()).to.equal(n18("49.9999"));

    await stakingPlatform
      .connect(accounts[1])
      .withdraw(await stakingPlatform.amountStaked(addresses[1]));
    await stakingPlatform
      .connect(accounts[2])
      .withdraw(await stakingPlatform.amountStaked(addresses[2]));

    const balance1Final = await token.balanceOf(addresses[1]);
    const balance2Final = await token.balanceOf(addresses[2]);
    const stakedAmount1Final = await stakingPlatform.amountStaked(addresses[1]);
    const stakedAmount2Final = await stakingPlatform.amountStaked(addresses[2]);

    expect(balance1Final).to.equal(
      balance1After.add(stakedAmount1After.add(user1Rewards))
    );
    expect(balance2Final).to.equal(
      balance2After.add(stakedAmount2After.add(user2Rewards))
    );

    expect(stakedAmount1Final).to.equal("0");
    expect(stakedAmount2Final).to.equal("0");
  });
});
