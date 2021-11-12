const { n18, increaseTime, claimAndStake, UINT_MAX } = require("./helpers");
const { expect } = require("chai");

describe("StakingPlatform - Mid Pool", () => {
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
    await token.transfer(addresses[2], n18("100000"));
    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "100000000000000000000000"
    );
  });

  it("Should deploy the new staking platform", async () => {
    const StakingPlatform = await ethers.getContractFactory(
      "StakingPlatformTester"
    );
    stakingPlatform = await StakingPlatform.deploy(
      token.address,
      12,
      365,
      270,
      n18("35000000")
    );
    await stakingPlatform.deployed();
  });

  it("Shoud increase precision", async () => {
    await stakingPlatform.setPrecision(28);
  });

  it("Should send tokens to staking platform", async () => {
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(n18("0"));
    await token.transfer(stakingPlatform.address, n18("35000000"));
    expect(await token.balanceOf(stakingPlatform.address)).to.equal(
      n18("35000000")
    );
  });

  it("Should deposit to staking platform", async () => {
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
    expect(await stakingPlatform.totalDeposited()).to.equal(n18("200000"));
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

  it("Should revert if exceed the max staking amount", async () => {
    await token.approve(stakingPlatform.address, UINT_MAX);
    await expect(stakingPlatform.deposit(n18("50000000"))).to.revertedWith(
      "Amount staked exceeds MaxStake"
    );
  });

  it("Should claim rewards and stake for 183 days", async () => {
    for (let i = 0; i < 183; i++) {
      await increaseTime(60 * 60 * 24);

      await claimAndStake(accounts[1], token, stakingPlatform);
    }
  }, 100000);

  it("Should claim rewards and stake for 182 (total 1year) days", async () => {
    for (let i = 0; i < 182; i++) {
      await increaseTime(60 * 60 * 24);

      await claimAndStake(accounts[1], token, stakingPlatform);
    }
  }, 100000);

  it("Should not withdraw residual balances before endingperiod + 1 year", async () => {
    await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
      "Withdraw 1year after endPeriod"
    );
  });

  it("Should withdraw residual balances", async () => {
    // increase time by 1 year
    await increaseTime(365 * 60 * 60 * 24);
    const balanceStakingBefore = String(
      await token.balanceOf(stakingPlatform.address)
    ).slice(0, 7);
    const balanceOwnerBefore = String(
      await token.balanceOf(addresses[0])
    ).slice(0, 7);
    expect(balanceStakingBefore).to.equal("3519992");
    expect(balanceOwnerBefore).to.equal("9648000");

    await stakingPlatform.withdrawResidualBalance();

    const balanceStakingAfter = String(
      await token.balanceOf(stakingPlatform.address)
    ).slice(0, 7);
    const balanceOwnerAfter = String(await token.balanceOf(addresses[0])).slice(
      0,
      7
    );
    expect(balanceStakingAfter).to.equal("2126689");
    expect(balanceOwnerAfter.toString()).to.equal("9997872");
  });

  it("Should fail withdraw initial deposit after withdrawResidualBalance", async () => {
    // Success enough balance
    await stakingPlatform.connect(accounts[1]).withdrawAll();

    // Fails not enough balance
    await expect(
      stakingPlatform.connect(accounts[2]).withdrawAll()
    ).to.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should withdraw initial deposit", async () => {
    await token.transfer(stakingPlatform.address, n18("1000000"));

    await stakingPlatform.connect(accounts[1]).withdrawAll();
    await stakingPlatform.connect(accounts[2]).withdrawAll();

    const balance1 = String(await token.balanceOf(addresses[1])).slice(0, 7);
    expect(balance1).to.equal("1127430");

    expect((await token.balanceOf(addresses[2])).toString()).to.equal(
      "112000000000000000000000"
    );
  });

  it("Should withdraw residual after tokens sent to contract", async () => {
    await stakingPlatform.withdrawResidualBalance();
  });

  it("Should fail withdraw residual if no residual balance", async () => {
    await expect(stakingPlatform.withdrawResidualBalance()).to.revertedWith(
      "No residual Balance to withdraw"
    );
  });
});
