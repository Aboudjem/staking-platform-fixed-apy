// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { n18 } = require("../test/helpers");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  await hre.run("compile");

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(n18("1000000000"));
  await token.deployed();

  const StakingPlatform = await hre.ethers.getContractFactory(
    "StakingPlatform"
  );

  const deepPool = await StakingPlatform.deploy(
    token.address,
    25,
    365,
    365,
    n18("20000000")
  );
  await deepPool.deployed();

  await deepPool.startStaking();

  const midPool = await StakingPlatform.deploy(
    token.address,
    12,
    365,
    270,
    n18("35000000")
  );
  await midPool.deployed();

  await midPool.startStaking();

  const quickPool = await StakingPlatform.deploy(
    token.address,
    9,
    365,
    180,
    n18("45000000")
  );

  await quickPool.deployed();

  await quickPool.startStaking();

  await token.transfer(quickPool.address, n18("40250000"));
  await token.transfer(midPool.address, n18("42000000"));
  await token.transfer(deepPool.address, n18("5000000"));

  setTimeout(async () => {
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [n18("1000000000")],
      contract: "contracts/token/Token.sol:Token",
    });
    await hre.run("verify:verify", {
      address: deepPool.address,
      constructorArguments: [token.address, 25, 365, 365, n18("20000000")],
      contract: "contracts/staking/StakingPlatform:StakingPlatform",
    });
    await hre.run("verify:verify", {
      address: midPool.address,
      constructorArguments: [token.address, 12, 365, 270, n18("35000000")],
    });
    await hre.run("verify:verify", {
      address: quickPool.address,
      constructorArguments: [token.address, 9, 365, 180, n18("45000000")],
    });
  }, 60000);

  console.log("Token deployed to:", token.address);
  console.log("Staking platform -- Deep Pool deployed to:", deepPool.address);
  console.log("Staking platform -- Mid Pool deployed to:", midPool.address);
  console.log("Staking platform -- Quick Pool deployed to:", quickPool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
