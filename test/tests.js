const { n18, increaseTime, UINT_MAX, ONE_DAY } = require("./helpers");
const { expect } = require("chai");

describe("StakingPlatform - PoolTests", () => {
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

  it("Should return rewards after 200 days (endPeriod + 100days)", async () => {
    await increaseTime(ONE_DAY * 200);
    const user1 = await stakingPlatform.rewardOf(addresses[1]);
    const user2 = await stakingPlatform.rewardOf(addresses[2]);
    const user3 = await stakingPlatform.rewardOf(addresses[3]);
    const user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal(n18("10000"));
    expect(user2.toString()).to.equal(n18("10000"));
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");
  });

  it("Should deposit after 50 days and farm until endPeriod", async () => {
    await increaseTime(ONE_DAY * 50);
    const balance3 = await token.balanceOf(addresses[3]);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[3]).deposit(balance3);
    expect((await token.balanceOf(addresses[3])).toString()).to.equal("0");

    const balance4 = await token.balanceOf(addresses[4]);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);
    expect((await token.balanceOf(addresses[4])).toString()).to.equal("0");

    let user1 = await stakingPlatform.rewardOf(addresses[1]);
    let user2 = await stakingPlatform.rewardOf(addresses[2]);
    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal(n18("5000"));
    expect(user2.toString()).to.equal(n18("5000"));
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");

    await increaseTime(ONE_DAY * 49);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal(n18("9900"));
    expect(user2.toString()).to.equal(n18("9900"));
    expect(user3.toString()).to.equal(n18("4900"));
    expect(user4.toString()).to.equal(n18("4900"));

    await increaseTime(ONE_DAY);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal(n18("10000"));
    expect(user2.toString()).to.equal(n18("10000"));
    expect(user3.toString()).to.equal("4999990000000000000000");
    expect(user4.toString()).to.equal("4999990000000000000000");
  });

  it("Should deposit after 50 days and farm until endPeriod: precision(20)", async () => {
    await stakingPlatform.setPrecision(20);
    await increaseTime(ONE_DAY * 50);
    const balance3 = await token.balanceOf(addresses[3]);
    const balance4 = await token.balanceOf(addresses[4]);

    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);
    await ethers.provider.send("evm_setAutomine", [false]);
    await stakingPlatform.connect(accounts[3]).deposit(balance3);
    await stakingPlatform.connect(accounts[4]).deposit(balance4);

    let user1 = await stakingPlatform.rewardOf(addresses[1]);
    let user2 = await stakingPlatform.rewardOf(addresses[2]);
    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.be.oneOf([
      "5000003472222222222200",
      "5000004629629629629600",
    ]);
    expect(user2.toString()).to.be.oneOf([
      "5000003472222222222200",
      "5000004629629629629600",
    ]);
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_mine");
    await increaseTime(ONE_DAY * 40);
    await increaseTime(ONE_DAY * 9);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("9900004629629629629600");
    expect(user2.toString()).to.equal("9900004629629629629600");
    expect(user3.toString()).to.equal("4900000000000000000000");
    expect(user4.toString()).to.equal("4900000000000000000000");

    await increaseTime(ONE_DAY);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("10000000000000000000000");
    expect(user2.toString()).to.equal("10000000000000000000000");
    expect(user3.toString()).to.equal("4999995370370370370300");
    expect(user4.toString()).to.equal("4999995370370370370300");
  });

  it("Should withdraw and deposit & farm all together at the same time until endPeriod", async () => {
    await stakingPlatform.setPrecision(20);
    await increaseTime(ONE_DAY * 50);

    await stakingPlatform.connect(accounts[1]).withdrawAll();
    await stakingPlatform.connect(accounts[2]).withdrawAll();

    await ethers.provider.send("evm_setAutomine", [false]);

    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[1]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[2]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[3]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[4]).deposit(n18("100000"));
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_mine");

    let user1 = await stakingPlatform.rewardOf(addresses[1]);
    let user2 = await stakingPlatform.rewardOf(addresses[2]);
    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("0");
    expect(user2.toString()).to.equal("0");
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");

    await increaseTime(ONE_DAY * 49);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.be.oneOf([
      "4900000000000000000000",
      "4900001157407407407400",
    ]);
    expect(user2.toString()).to.be.oneOf([
      "4900000000000000000000",
      "4900001157407407407400",
    ]);
    expect(user3.toString()).to.be.oneOf([
      "4900000000000000000000",
      "4900001157407407407400",
    ]);
    expect(user4.toString()).to.be.oneOf([
      "4900000000000000000000",
      "4900001157407407407400",
    ]);

    await increaseTime(ONE_DAY * 49);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("4999995370370370370300");
    expect(user2.toString()).to.equal("4999995370370370370300");
    expect(user3.toString()).to.equal("4999995370370370370300");
    expect(user4.toString()).to.equal("4999995370370370370300");
  });

  it("Should withdraw after 99 days and re-deposit and farm until endPeriod, withdraw scenario", async () => {
    await increaseTime(ONE_DAY * 99);

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();

    await ethers.provider.send("evm_setAutomine", [false]);

    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[1]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[2]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[3]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[4]).deposit(n18("100000"));
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_mine");

    let user1 = await stakingPlatform.rewardOf(addresses[1]);
    let user2 = await stakingPlatform.rewardOf(addresses[2]);
    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("0");
    expect(user2.toString()).to.equal("0");
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");

    await increaseTime(ONE_DAY);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("99990000000000000000");
    expect(user2.toString()).to.equal("99990000000000000000");
    expect(user3.toString()).to.equal("99990000000000000000");
    expect(user4.toString()).to.equal("99990000000000000000");

    const balanceUser1 = await token.balanceOf(addresses[1]);
    const balanceUser2 = await token.balanceOf(addresses[2]);
    const balanceUser3 = await token.balanceOf(addresses[3]);
    const balanceUser4 = await token.balanceOf(addresses[4]);

    const amountStaked1 = await stakingPlatform.amountStaked(addresses[1]);
    const amountStaked2 = await stakingPlatform.amountStaked(addresses[2]);
    const amountStaked3 = await stakingPlatform.amountStaked(addresses[3]);
    const amountStaked4 = await stakingPlatform.amountStaked(addresses[4]);

    await stakingPlatform.connect(accounts[1]).withdrawAll();
    await stakingPlatform.connect(accounts[2]).withdrawAll();
    await stakingPlatform.connect(accounts[3]).withdrawAll();
    await stakingPlatform.connect(accounts[4]).withdrawAll();

    expect(await token.balanceOf(addresses[1])).to.equal(
      balanceUser1.add(amountStaked1).add(user1)
    );
    expect(await token.balanceOf(addresses[2])).to.equal(
      balanceUser2.add(amountStaked2).add(user2)
    );
    expect(await token.balanceOf(addresses[3])).to.equal(
      balanceUser3.add(amountStaked3).add(user3)
    );
    expect(await token.balanceOf(addresses[4])).to.equal(
      balanceUser4.add(amountStaked4).add(user4)
    );
  });

  it("Should withdraw after 99 days and re-deposit and farm until endPeriod, claimRewards scenario", async () => {
    await increaseTime(ONE_DAY * 99);

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();

    await ethers.provider.send("evm_setAutomine", [false]);

    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[1]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[2]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[3]).deposit(n18("100000"));
    await stakingPlatform.connect(accounts[4]).deposit(n18("100000"));
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_mine");

    let user1 = await stakingPlatform.rewardOf(addresses[1]);
    let user2 = await stakingPlatform.rewardOf(addresses[2]);
    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("0");
    expect(user2.toString()).to.equal("0");
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");

    await increaseTime(ONE_DAY);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("99990000000000000000");
    expect(user2.toString()).to.equal("99990000000000000000");
    expect(user3.toString()).to.equal("99990000000000000000");
    expect(user4.toString()).to.equal("99990000000000000000");

    const balanceUser1 = await token.balanceOf(addresses[1]);
    const balanceUser2 = await token.balanceOf(addresses[2]);
    const balanceUser3 = await token.balanceOf(addresses[3]);
    const balanceUser4 = await token.balanceOf(addresses[4]);

    const amountStaked1 = await stakingPlatform.amountStaked(addresses[1]);
    const amountStaked2 = await stakingPlatform.amountStaked(addresses[2]);
    const amountStaked3 = await stakingPlatform.amountStaked(addresses[3]);
    const amountStaked4 = await stakingPlatform.amountStaked(addresses[4]);

    await stakingPlatform.connect(accounts[1]).claimRewards();
    await stakingPlatform.connect(accounts[2]).claimRewards();
    await stakingPlatform.connect(accounts[3]).claimRewards();
    await stakingPlatform.connect(accounts[4]).claimRewards();

    expect(await token.balanceOf(addresses[1])).to.equal(
      balanceUser1.add(user1)
    );
    expect(await token.balanceOf(addresses[2])).to.equal(
      balanceUser2.add(user2)
    );
    expect(await token.balanceOf(addresses[3])).to.equal(
      balanceUser3.add(user3)
    );
    expect(await token.balanceOf(addresses[4])).to.equal(
      balanceUser4.add(user4)
    );

    await stakingPlatform.connect(accounts[1]).withdrawAll();
    await stakingPlatform.connect(accounts[2]).withdrawAll();
    await stakingPlatform.connect(accounts[3]).withdrawAll();
    await stakingPlatform.connect(accounts[4]).withdrawAll();

    expect(await token.balanceOf(addresses[1])).to.equal(
      balanceUser1.add(amountStaked1).add(user1)
    );
    expect(await token.balanceOf(addresses[2])).to.equal(
      balanceUser2.add(amountStaked2).add(user2)
    );
    expect(await token.balanceOf(addresses[3])).to.equal(
      balanceUser3.add(amountStaked3).add(user3)
    );
    expect(await token.balanceOf(addresses[4])).to.equal(
      balanceUser4.add(amountStaked4).add(user4)
    );
  });

  it("Should withdraw after 99 and farm until endPeriod (1day)", async () => {
    await increaseTime(ONE_DAY * 99);

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();

    await ethers.provider.send("evm_setAutomine", [false]);

    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[1]).deposit(n18("100000"));

    await stakingPlatform.connect(accounts[2]).deposit(n18("100000"));

    await stakingPlatform.connect(accounts[3]).deposit(n18("100000"));

    await stakingPlatform.connect(accounts[4]).deposit(n18("100000"));
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_mine");

    let user1 = await stakingPlatform.rewardOf(addresses[1]);
    let user2 = await stakingPlatform.rewardOf(addresses[2]);
    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("0");
    expect(user2.toString()).to.equal("0");
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");

    await increaseTime(ONE_DAY / 2);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("50000000000000000000");
    expect(user2.toString()).to.equal("50000000000000000000");
    expect(user3.toString()).to.equal("50000000000000000000");
    expect(user4.toString()).to.equal("50000000000000000000");

    await increaseTime(ONE_DAY / 2);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("99990000000000000000");
    expect(user2.toString()).to.equal("99990000000000000000");
    expect(user3.toString()).to.equal("99990000000000000000");
    expect(user4.toString()).to.equal("99990000000000000000");
    await increaseTime(ONE_DAY / 2);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("99990000000000000000");
    expect(user2.toString()).to.equal("99990000000000000000");
    expect(user3.toString()).to.equal("99990000000000000000");
    expect(user4.toString()).to.equal("99990000000000000000");
  });

  it("Should withdraw after 99 and farm half a day and then withdraw before ending", async () => {
    await increaseTime(ONE_DAY * 99);

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();

    await ethers.provider.send("evm_setAutomine", [false]);

    await token.connect(accounts[1]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[2]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[3]).approve(stakingPlatform.address, UINT_MAX);
    await token.connect(accounts[4]).approve(stakingPlatform.address, UINT_MAX);

    await stakingPlatform.connect(accounts[1]).deposit(n18("100000"));

    await stakingPlatform.connect(accounts[2]).deposit(n18("100000"));

    await stakingPlatform.connect(accounts[3]).deposit(n18("100000"));

    await stakingPlatform.connect(accounts[4]).deposit(n18("100000"));
    await ethers.provider.send("evm_setAutomine", [true]);
    await ethers.provider.send("evm_mine");

    let user1 = await stakingPlatform.rewardOf(addresses[1]);
    let user2 = await stakingPlatform.rewardOf(addresses[2]);
    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("0");
    expect(user2.toString()).to.equal("0");
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");

    await increaseTime(ONE_DAY / 2);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("50000000000000000000");
    expect(user2.toString()).to.equal("50000000000000000000");
    expect(user3.toString()).to.equal("50000000000000000000");
    expect(user4.toString()).to.equal("50000000000000000000");

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();

    await stakingPlatform.connect(accounts[3]).withdrawAll();

    await stakingPlatform.connect(accounts[4]).withdrawAll();
    await increaseTime(ONE_DAY / 2);
    user1 = await stakingPlatform.rewardOf(addresses[1]);
    user2 = await stakingPlatform.rewardOf(addresses[2]);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user1.toString()).to.equal("0");
    expect(user2.toString()).to.equal("0");
    expect(user3.toString()).to.equal("0");
    expect(user4.toString()).to.equal("0");
  });

  it("Should test with 0", async () => {
    await increaseTime(ONE_DAY * 99);

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();

    await token.connect(accounts[1]).approve(stakingPlatform.address, 1);
    await token.connect(accounts[2]).approve(stakingPlatform.address, 1);
    await token.connect(accounts[3]).approve(stakingPlatform.address, 1);
    await token.connect(accounts[4]).approve(stakingPlatform.address, 1);

    await expect(
      stakingPlatform.connect(accounts[1]).deposit("0")
    ).to.revertedWith("Amount must be greater than 0");
    await expect(
      stakingPlatform.connect(accounts[2]).deposit("0")
    ).to.revertedWith("Amount must be greater than 0");
    await expect(
      stakingPlatform.connect(accounts[3]).deposit("0")
    ).to.revertedWith("Amount must be greater than 0");
    await expect(
      stakingPlatform.connect(accounts[4]).deposit("0")
    ).to.revertedWith("Amount must be greater than 0");
  });

  it("Should test with low value", async () => {
    await token.connect(accounts[3]).approve(stakingPlatform.address, n18("1"));
    await token.connect(accounts[4]).approve(stakingPlatform.address, n18("1"));

    await stakingPlatform.connect(accounts[3]).deposit(n18("1"));
    await stakingPlatform.connect(accounts[4]).deposit(n18("1"));

    await increaseTime(ONE_DAY * 99);

    let user3 = await stakingPlatform.rewardOf(addresses[3]);
    let user4 = await stakingPlatform.rewardOf(addresses[4]);

    expect(user3.toString()).to.equal("99000000000000000");
    expect(user4.toString()).to.equal("99000000000000000");

    await increaseTime(ONE_DAY);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user3.toString()).to.equal("99999900000000000");
    expect(user4.toString()).to.equal("99999900000000000");

    await increaseTime(ONE_DAY / 2);
    user3 = await stakingPlatform.rewardOf(addresses[3]);
    user4 = await stakingPlatform.rewardOf(addresses[4]);
    expect(user3.toString()).to.equal("99999900000000000");
    expect(user4.toString()).to.equal("99999900000000000");

    const amountStaked3 = await stakingPlatform.amountStaked(addresses[3]);
    const amountStaked4 = await stakingPlatform.amountStaked(addresses[4]);

    expect(user3.toString()).to.equal("99999900000000000");
    expect(user4.toString()).to.equal("99999900000000000");

    expect(amountStaked3.toString()).to.equal("1000000000000000000");
    expect(amountStaked4.toString()).to.equal("1000000000000000000");

    await stakingPlatform.connect(accounts[3]).withdrawAll();

    await stakingPlatform.connect(accounts[4]).withdrawAll();
  });

  it("Should fail with very low value", async () => {
    await increaseTime(ONE_DAY * 50);

    await token
      .connect(accounts[3])
      .approve(stakingPlatform.address, 100000000);
    await token
      .connect(accounts[4])
      .approve(stakingPlatform.address, 100000000);

    await stakingPlatform.connect(accounts[3]).deposit("1000");
    await stakingPlatform.connect(accounts[4]).deposit("10000");
  });

  it("Should withdraw residual if nobody claimedRewards", async () => {
    await increaseTime(ONE_DAY * 600);
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("50200000000000000000000000");
    await stakingPlatform.withdrawResidualBalance();
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("200000000000000000000000");
  });

  it("Should withdraw residual if rewards claimed", async () => {
    await increaseTime(ONE_DAY * 600);

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();

    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("49980000000000000000000000");
    await stakingPlatform.withdrawResidualBalance();
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("0");
  });

  it("Should withdraw residual if rewards claimed (with low values)", async () => {
    await token.connect(accounts[3]).approve(stakingPlatform.address, n18("1"));
    await token.connect(accounts[4]).approve(stakingPlatform.address, n18("1"));

    await stakingPlatform.connect(accounts[3]).deposit(n18("1"));
    await stakingPlatform.connect(accounts[4]).deposit(n18("1"));

    await increaseTime(ONE_DAY * 600);

    await stakingPlatform.connect(accounts[1]).withdrawAll();

    await stakingPlatform.connect(accounts[2]).withdrawAll();
    await stakingPlatform.connect(accounts[3]).withdrawAll();
    await stakingPlatform.connect(accounts[4]).withdrawAll();

    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("49979999800000200000000000");
    await stakingPlatform.withdrawResidualBalance();
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("0");
  });

  it("Should withdraw residual if nobody claimedRewards (with low values)", async () => {
    await token.connect(accounts[3]).approve(stakingPlatform.address, n18("1"));
    await token.connect(accounts[4]).approve(stakingPlatform.address, n18("1"));

    await stakingPlatform.connect(accounts[3]).deposit(n18("1"));
    await stakingPlatform.connect(accounts[4]).deposit(n18("1"));

    await increaseTime(ONE_DAY * 600);

    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("50200002000000000000000000");
    await stakingPlatform.withdrawResidualBalance();
    expect(
      (await token.balanceOf(stakingPlatform.address)).toString()
    ).to.equal("200002000000000000000000");
  });
});
