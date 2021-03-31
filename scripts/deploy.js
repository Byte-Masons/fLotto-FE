
// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {

  let drawFrequency = 1;
  //let ticketPrice = ethers.utils.parseEther("1");
  let name = "JB's Lottery";
  let recipient = '0x5088FeD7b844FBf4c7B6689AA7cf8A5E5Ce348ff';
  let modulus = 10;

  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Lotto = await ethers.getContractFactory("FantomLottery");
  const lottery = await Lotto.deploy(drawFrequency, ethers.utils.parseEther("1"), name, recipient, modulus);

  await lottery.deployed();

  console.log("Lotto address:", lottery.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(lottery);
}

function saveFrontendFiles(lotto) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Lotto: lotto.address }, undefined, 2)
  );

  const LottoArtifact = artifacts.readArtifactSync("FantomLottery");

  fs.writeFileSync(
    __dirname + "/../src/artifacts/contracts/Lotto.sol/FantomLottery.json",
    JSON.stringify(LottoArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
