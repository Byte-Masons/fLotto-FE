const fs = require("fs");

// This file is only here to make interacting with the Dapp easier,
// feel free to ignore it if you don't need it.

task("faucet", "Sends ETH to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async ({ receiver }) => {
    if (network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    const [sender] = await ethers.getSigners();

    for (i = 0; i<100; i++){
      let tx = await sender.sendTransaction({
        to: receiver,
        value: ethers.constants.WeiPerEther,
      });
      await tx.wait();
    }

    console.log(`Transferred 100 ETH to ${receiver}`);
  });
