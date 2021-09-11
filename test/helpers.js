const { utils } = require("ethers");

function n18(amount) {
  return utils.parseUnits(amount, "ether");
}

async function increaseTime(duration) {
  await ethers.provider.send("evm_increaseTime", [duration]);
  await ethers.provider.send("evm_mine");
}

module.exports = {
  n18,
  increaseTime,
};
