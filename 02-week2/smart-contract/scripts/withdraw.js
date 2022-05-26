const hre = require('hardhat');
const abi = require('../artifacts/contracts/TipMe.sol/TipMe.json');

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  // Get the contract that has been deployed to Goerli
  const contractAddress = '0xe6FBB1b9d922d922A801424F77f2EdBD6ba254c0';
  const contractABI = abi.abi;

  // Get the node connection and wallet connection
  const provider = new hre.ethers.providers.AlchemyProvider(
    'goerli',
    process.env.GOERLI_API_KEY
  );

  // Ensure that signer is the SAME address as the original contract
  // or else this script will not work
  const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Instantiate connected contract
  const tipMe = new hre.ethers.Contract(contractAddress, contractABI, signer);

  // Check starting balances
  console.log(
    "Owner's balance: ",
    await getBalance(provider, signer.address),
    'ETH'
  );
  const contractBalance = await getBalance(provider, tipMe.address);
  console.log(
    "Contract's balance: ",
    await getBalance(provider, tipMe.address),
    'ETH'
  );

  // Withdraw funds if there are funds to withdraw
  if (contractBalance !== '0.0') {
    console.log('Withdrawing funds...');
    const withdraw = await tipMe.withdrawTips();
    await withdraw.wait();
  } else {
    console.log('No funds to withdraw.');
  }

  // Check ending balance
  console.log(
    "Owner's current balance: ",
    await getBalance(provider, signer.address),
    'ETH'
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
