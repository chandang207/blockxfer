/*BRIDGE TRANSACTION*/

const transfer = async () => {
    // Replace with your deployed smart contract address
    const contractAddress = "0x...";
    // Replace with the ERC20 token contract address you want to transfer
    const tokenAddress = "0x...";
    // The ABI of the EtherAndTokenReceiver contract
    const contractAbi = [ /* ... */ ];
    // The ABI of the ERC20 token contract with the `approve` function
    const erc20Abi = [ /* ... */ ];
    // The amount of ERC20 tokens to transfer (in the smallest unit)
    const tokenAmount = ethers.utils.parseUnits("1", 18);
    // The amount of Ether to transfer (in wei)
    const etherAmount = ethers.utils.parseEther("0.1");
    // Create instances of the contracts
    const receiverContract = new ethers.Contract(contractAddress, contractAbi, signer);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
    try {
        // Approve the smart contract to transfer the ERC20 tokens on behalf of the user
        const approveTx = await tokenContract.approve(contractAddress, tokenAmount);
        await approveTx.wait();

        // Call the depositERC20 function on the smart contract
        const depositTx = await receiverContract.depositERC20(tokenAddress, tokenAmount, { value: etherAmount });
        await depositTx.wait();

        console.log("Transfer successful");
    } catch (error) {
        console.error("Transfer failed:", error);
    }
};