const { utils } = require("ethers");

function n18(amount) {
  return utils.parseUnits(amount, "ether");
}

async function increaseTime(duration) {
  await ethers.provider.send("evm_increaseTime", [duration]);
  await ethers.provider.send("evm_mine");
}

async function claimAndStake(account, token, stakingPlatform) {
  await ethers.provider.send("evm_setAutomine", [false]);
  const accountAddress = account.address;
  await stakingPlatform.connect(account).claimRewards();
  await token
    .connect(account)
    .approve(stakingPlatform.address, token.totalSupply());
  const balanceOfUser = await token.balanceOf(accountAddress);
  await stakingPlatform.connect(account).deposit(balanceOfUser);
  await ethers.provider.send("evm_setAutomine", [true]);
}

module.exports = {
  n18,
  increaseTime,
  claimAndStake,
};
