const hre = require('hardhat');

// Returns the Ether balance of a given address
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from tipping contract
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`
    );
  }
}

async function main() {
  // Get the example accounts we'll be working with
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the contract to deploy
  const TipMe = await hre.ethers.getContractFactory('TipMe');
  const tipMe = await TipMe.deploy();

  // Deploy the contract
  await tipMe.deployed();
  console.log('TipMe deployed to:', tipMe.address);

  // Check balances before the tipping
  const addresses = [owner.address, tipper.address, tipMe.address];
  console.log('===== start =====');
  await printBalances(addresses);

  // Doing tipping
  const tips = { value: hre.ethers.utils.parseEther('1') };
  await tipMe
    .connect(tipper)
    .tipping(
      'Satoshi',
      "I'm creating the most complex money under shadow.",
      tips
    );
  await tipMe
    .connect(tipper2)
    .tipping('Vitalik', "I'm Ethereum God, you plebs.", tips);
  await tipMe
    .connect(tipper3)
    .tipping('Elon', "I'll go to mars while you laugh at my meme.", tips);

  // Check balances after the tipping
  console.log('===== tipping done =====');
  await printBalances(addresses);

  // Withdraw
  await tipMe.connect(owner).withdrawTips();

  // Check balances after withdrawal
  console.log('===== withdraw tips =====');
  await printBalances(addresses);

  // Check out the memos
  console.log('===== memos =====');
  const memos = await tipMe.getMemos();
  await printMemos(memos);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
