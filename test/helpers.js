const { utils } = require("ethers");

const UINT_MAX =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const ONE_DAY = 86400;

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
  const balanceOfUser = await token.balanceOf(accountAddress);
  await stakingPlatform.connect(account).deposit(balanceOfUser);
  await ethers.provider.send("evm_setAutomine", [true]);
}

module.exports = {
  n18,
  increaseTime,
  claimAndStake,
  UINT_MAX,
  ONE_DAY,
};
