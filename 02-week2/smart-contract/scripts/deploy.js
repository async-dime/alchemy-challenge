const hre = require('hardhat');

async function main() {
  // We get the contract to deploy
  const TipMe = await hre.ethers.getContractFactory('TipMe');
  const tipMe = await TipMe.deploy();

  // We deploy the contract
  await tipMe.deployed();

  console.log('TipMe deployed to:', tipMe.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
