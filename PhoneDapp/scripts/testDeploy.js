const hardhat = require("hardhat");
const { ethers } = require('ethers');
const phoneAbi = require('../abis/phone.json');
const { encrypt, decrypt} = require('./encryption');
require('dotenv').config();
const keyHex = process.env.SECRET_ENCRYPTION_KEY;
let encryptedPhNumber;//used in resolvePhonetoPublicAddress
let hashVal; //used in sendEcrowPayment


let phoneContractAddress, owner, account1, account2, account3, account4, account5, account6;

deployContracts = async () => 
{
    [owner, account1, account2, account3, account4, account5, account6] = await hardhat.ethers.getSigners();
    const tokenContractFactory = await hardhat.ethers.getContractFactory("TokenOZ");
    const phoneContractFactory = await hardhat.ethers.getContractFactory("PhoneTransfer");

    const deployUSDContract_1 = await tokenContractFactory.deploy("10000", "USD", "USD");
    const deployUSDTTokenContract_1 = await tokenContractFactory.deploy("1000000", "USDT", "USDT");
    const deployUSDCTokenContract_1 = await tokenContractFactory.deploy("1000000", "USDC", "USDC");
    const deployDAITokenContract_1 = await tokenContractFactory.deploy("1000000", "DAI", "DAI");

    await deployUSDTTokenContract_1.connect(owner).transfer(account1.address, convertToWei(10000));
    await deployUSDTTokenContract_1.connect(owner).transfer(account2.address, convertToWei(10000));
    await deployUSDTTokenContract_1.connect(owner).transfer(account3.address, convertToWei(10000));
    await deployUSDTTokenContract_1.connect(owner).transfer(account4.address, convertToWei(10000));
    await deployUSDTTokenContract_1.connect(owner).transfer(account5.address, convertToWei(10000));
    await deployUSDTTokenContract_1.connect(owner).transfer(account6.address, convertToWei(10000));

    await deployUSDCTokenContract_1.connect(owner).transfer(account1.address, convertToWei(10000));
    await deployUSDCTokenContract_1.connect(owner).transfer(account2.address, convertToWei(10000));
    await deployUSDCTokenContract_1.connect(owner).transfer(account3.address, convertToWei(10000));
    await deployUSDCTokenContract_1.connect(owner).transfer(account4.address, convertToWei(10000));
    await deployUSDCTokenContract_1.connect(owner).transfer(account5.address, convertToWei(10000));
    await deployUSDCTokenContract_1.connect(owner).transfer(account6.address, convertToWei(10000));

    await deployDAITokenContract_1.connect(owner).transfer(account1.address, convertToWei(10000));
    await deployDAITokenContract_1.connect(owner).transfer(account2.address, convertToWei(10000));
    await deployDAITokenContract_1.connect(owner).transfer(account3.address, convertToWei(10000));
    await deployDAITokenContract_1.connect(owner).transfer(account4.address, convertToWei(10000));
    await deployDAITokenContract_1.connect(owner).transfer(account5.address, convertToWei(10000));
    await deployDAITokenContract_1.connect(owner).transfer(account6.address, convertToWei(10000));

    const deployPhoneContract = await phoneContractFactory.deploy("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    phoneContractAddress = deployPhoneContract.address;

    console.log(`Deployed Phone: ${deployPhoneContract.address}`);
    console.log('USD address:  ', deployUSDContract_1.address)
    console.log('USDT address:  ', deployUSDTTokenContract_1.address)
    console.log('USDC address:  ', deployUSDCTokenContract_1.address)
    console.log('DAI address:  ', deployDAITokenContract_1.address)
    console.log('owner:  ',owner.address);
    console.log('account1:  ',account1.address);
    console.log('account2:  ',account2.address);
    console.log('account3:  ',account3.address);
    console.log('account4:  ',account4.address);
    console.log('account5:  ',account5.address);
    console.log('account6:  ',account6.address);
}

main = async () => 
{
   /*const provider =  new hardhat.ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
   console.log(provider);
   
    const { chainId } = await hardhat.ethers.provider.getNetwork();
    console.log("Chainid:   ",chainId);*/
    [owner, account1, account2, account3, account4] = await hardhat.ethers.getSigners();

    console.log("owner:  ", owner.address);
    console.log("account1:  ", account1.address);
    console.log("account2:  ", account2.address);
    console.log("account3:  ", account3.address);
    console.log("account4:  ", account4.address);

    const tokenContractFactory = await hardhat.ethers.getContractFactory("TokenOZ");
    const phoneContractFactory = await hardhat.ethers.getContractFactory("PhoneTransfer");

    const deployTokenContract_1 = await tokenContractFactory.deploy("10000", "MINA", "MINA");
    const deployPhoneContract = await phoneContractFactory.deploy("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    phoneContractAddress = deployPhoneContract.address;

    console.log(`Deployed Token1: ${deployTokenContract_1.address}`);
    console.log(`Deployed Phone: ${deployPhoneContract.address}`);

    await deployTokenContract_1.connect(owner).transfer(account3.address, convertToWei(1000));
    
    //normal send function
    await deployTokenContract_1.connect(owner).approve(deployPhoneContract.address, convertToWei(2000));
    const transaction = await deployPhoneContract.connect(owner).transferTokens(account1.address, deployTokenContract_1.address, convertToWei(1000));
    const result = await transaction.wait();

    //requestPayment(address requestedFrom, address requestedBy, address tokenAddr, uint amount) public 
    await deployPhoneContract.connect(account2).requestPayment(owner.address, account2.address, deployTokenContract_1.address, convertToWei(500));
    await deployPhoneContract.connect(owner).fullFillRequestPayment(1, 1);
    

    //send escrow payment
    encryptedPhNumber = encrypt('+919176029790', keyHex);
    hashVal = hashOneStrings(encryptedPhNumber);
    console.log("Hashval: ",hashVal);

    await deployTokenContract_1.connect(account3).approve(deployPhoneContract.address, convertToWei(1000));
    await deployPhoneContract.connect(account3).sendEcrowPayment(hashVal, deployTokenContract_1.address, convertToWei(500));
    await deployPhoneContract.connect(owner).resolvePhonetoPublicAddress(2, encryptedPhNumber, account4.address);
    console.log(await deployTokenContract_1.connect(owner).balanceOf(account4.address));
    await deployPhoneContract.connect(account4).fullFillEscrowPayment(2, 3);
    console.log(await deployTokenContract_1.connect(owner).balanceOf(account4.address));

/* 
    MUMBAI(POLYGON): 80001
    BINANCE: 97
    AVALANCHE: 43113
    //send 5 ausdt
*/
    //bridge send transaction:

    //Ethereum ADD POLYGON CONTRACT
    //await deployPhoneContract.updateMultiChainNamesResolver(80001, "Polygon");
    //await deployPhoneContract.updateMultiChainContractAddress(80001, );


    //Polygon ADD ETHEREUM CONTRACT
    //await deployPhoneContract.updateMultiChainNamesResolver(5, "ethereum-2");
    //await deployPhoneContract.updateMultiChainContractAddress(5, );


   /*await deployTokenContract_1.connect(owner).approve(deployPhoneContract, 5000000);
    await deployPhoneContract.connect(owner).handleCrossChainTransfer(account2.address, "aUSDT", 5000000, 80001);*/

    //analyseLogs();
    /*
    await deployExchangeContract.connect(account1).limitOrder(convertToWei(15), convertToWei(8), 1, "MINAUSDT", 
    {gasPrice: hardhat.ethers.utils.parseUnits('100', 'gwei'), gasLimit: 1000000});
    */
}


getSentTransactionsData = async (deployPhoneContract) => 
{
    //SENT TRANSACTIONS:
    const filterpRE = deployPhoneContract.filters.prePaymentEve(null, owner.address, null, null, null);
    const prePayments = await deployPhoneContract.queryFilter(filterpRE);

    const filterpOST = deployPhoneContract.filters.postPaymentEve(null, owner.address, null, null);
    const postPayments = await deployPhoneContract.queryFilter(filterpOST);

    const successfulTransactions = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
          postLog.args.transactionNo.toString() === preTransactionNo
        );
      });

      const failedTransactions = prePayments.filter(preLog => {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return !postPayments.some(postLog =>
          postLog.args.transactionNo.toString() === preTransactionNo
        );
      });

    return [successfulTransactions, failedTransactions];
}


getReceiveTransactionsData = async (deployPhoneContract) => 
{
    //RECEIVE TRANSACTIONS:
    const filterpRE = deployPhoneContract.filters.prePaymentEve(null, null, account1.address, null, null);
    const prePayments = await deployPhoneContract.queryFilter(filterpRE);

    const filterpOST = deployPhoneContract.filters.postPaymentEve(null, null, account1.address, null);
    const postPayments = await deployPhoneContract.queryFilter(filterpOST);

    const successfulTransactions = prePayments.filter(preLog => 
    {
        console.log(preLog.args)
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    const failedTransactions = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return !postPayments.some(postLog =>
          postLog.args.transactionNo.toString() === preTransactionNo
        );
      });

    return [successfulTransactions, failedTransactions];
}


getSentRequestsData = async (deployPhoneContract) => 
{
    const filterpRE = deployPhoneContract.filters.requestPaymentEve(null, account2.address, null, null, null, null);
    const prePayments = await deployPhoneContract.queryFilter(filterpRE);

    const filterpOST = deployPhoneContract.filters.fullfillRequestPaymentEve(null, account2.address, null, null, null);
    const postPayments = await deployPhoneContract.queryFilter(filterpOST);


    const successfulRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    const failedRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return !postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    return [successfulRequests, failedRequests];
}

getReceiveRequestsData = async (deployPhoneContract) => 
{
    const filterpRE = deployPhoneContract.filters.requestPaymentEve(null, null, owner.address, null, null, null);
    const prePayments = await deployPhoneContract.queryFilter(filterpRE);

    const filterpOST = deployPhoneContract.filters.fullfillRequestPaymentEve(null, null, owner.address, null, null);
    const postPayments = await deployPhoneContract.queryFilter(filterpOST);


    const successfulRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    const failedRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return !postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    return [successfulRequests, failedRequests];
}

async function getSentEscrowRequestsData(deployPhoneContract)
{
    const filterpRE = deployPhoneContract.filters.escrowPaymentEve(null, account3.address , null, null, null);
    const prePayments = await deployPhoneContract.queryFilter(filterpRE);

    const filterpOST = deployPhoneContract.filters.fullfillEscrowPaymentEve(null, account3.address, null, null, null);
    const postPayments = await deployPhoneContract.queryFilter(filterpOST);


    const successfulRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    const failedRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return !postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    return [successfulRequests, failedRequests];
}


async function getReceivedEscrowRequestsData(deployPhoneContract)
{
    console.log(hashVal)
    const filterpRE = deployPhoneContract.filters.escrowPaymentEve(null, null, hashVal , null, null);
    const prePayments = await deployPhoneContract.queryFilter(filterpRE);

    const filterpOST = deployPhoneContract.filters.fullfillEscrowPaymentEve(null, null, hashVal, null, null);
    const postPayments = await deployPhoneContract.queryFilter(filterpOST);


    const successfulRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    const failedRequests = prePayments.filter(preLog => 
    {
        const preTransactionNo = preLog.args.transactionNo.toString();
        return !postPayments.some(postLog =>
            postLog.args.transactionNo.toString() === preTransactionNo
        );
    });

    return [successfulRequests, failedRequests];
}
 
analyseLogs = async () => 
{
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');

    [owner, account1, account2, account3] = await hardhat.ethers.getSigners();
    const deployPhoneContract = new ethers.Contract('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', phoneAbi, provider);

    /* NORMAL TRANSACTIONS - SENT */
    const sentTransactions = await getSentTransactionsData(deployPhoneContract);
    const receivedTransactions = await getReceiveTransactionsData(deployPhoneContract);


    console.log("*********************************************************Sent Transactions*********************************************************");
    console.log(sentTransactions[0]);
    console.log(sentTransactions[1]);
    console.log("*********************************************************Sent Transactions*********************************************************\n\n");


    console.log("*********************************************************Received Transactions*********************************************************");
    console.log("Received Transactions: ");
    console.log(receivedTransactions[0]);
    console.log(receivedTransactions[1]);
    console.log("*********************************************************Received Transactions*********************************************************\n\n");



    /* NORMAL TRANSACTIONS - RECEIVE REQUEST */
    const sentRequests = await getSentRequestsData(deployPhoneContract);
    const receivedRequests = await getReceiveRequestsData(deployPhoneContract);

    console.log("*********************************************************Sent Requests*********************************************************");

    console.log(sentRequests[0]);
    console.log(sentRequests[1]);

    console.log("*********************************************************Sent Requests*********************************************************\n\n");


    console.log("*********************************************************Received Requests*********************************************************");

    console.log(receivedRequests[0]);
    console.log(receivedRequests[1]);

    console.log("*********************************************************Received Requests*********************************************************\n\n");



    /* ESCROW TRANSACTIONS - SENT REQUEST(RECEIVE IS NOT ALLOWED) */
    const sentEscrowRequests = await getSentEscrowRequestsData(deployPhoneContract);
    const receivedEscrowRequests = await getReceivedEscrowRequestsData(deployPhoneContract);

    console.log("*********************************************************ESCROW SENT Requests*********************************************************");

    console.log(sentEscrowRequests[0]);
    console.log(sentEscrowRequests[1]);

    console.log("*********************************************************ESCROW SENT Requests*********************************************************\n\n");


    console.log("*********************************************************ESCROW Received Requests*********************************************************");

    console.log(receivedEscrowRequests[0]);
    console.log(receivedEscrowRequests[1]);

    console.log("*********************************************************ESCROW Received Requests*********************************************************\n\n");
}

mainDeployed = async () => 
{
    const { chainId } = await hardhat.ethers.provider.getNetwork();
    console.log("Chainid:   ",chainId)
    const [owner, feeAccount, account1, account2, account3] = await hardhat.ethers.getSigners();

    const deployedTokenContract_1 = await hardhat.ethers.getContractAt("TokenOZ", config[chainId].MINA.address);
    const deployedTokenContract_2 = await hardhat.ethers.getContractAt("TokenOZ",  config[chainId].USDT.address);
    const deployedExchangeContract = await hardhat.ethers.getContractAt("Exchange",  config[chainId].exchange.address);
  
    await deployedTokenContract_1.connect(owner).transfer(account1.address, convertToWei(1000));
    await deployedTokenContract_2.connect(owner).transfer(account2.address, convertToWei(1000));

    await deployedTokenContract_1.connect(account1).approve(deployedExchangeContract.address, convertToWei(1000));
    await deployedExchangeContract.connect(account1).depositToken(deployedTokenContract_1.address, convertToWei(1000));

    await deployedTokenContract_2.connect(account2).approve(deployedExchangeContract.address, convertToWei(1000));
    await deployedExchangeContract.connect(account2).depositToken(deployedTokenContract_2.address, convertToWei(1000));

    await deployedExchangeContract.connect(owner).RegisterMarket(deployedTokenContract_1.address, deployedTokenContract_2.address, "MINA", "USDT");

    await deployedExchangeContract.connect(account1).limitOrder(convertToWei(15), convertToWei(8), 1, "MINAUSDT", 
    {gasPrice: hardhat.ethers.utils.parseUnits('100', 'gwei'), gasLimit: 1000000});

    console.log(`Deployed Token: ${deployedTokenContract_1.address}`);
    console.log(`Deployed Token: ${deployedTokenContract_2.address}`);
    console.log(`Deployed Exchange: ${deployedExchangeContract.address}`);
    console.log(`Fee Address: ${feeAccount.address}`);

}

const convertToWei = (inp) => 
{
    return hardhat.ethers.utils.parseUnits(inp.toString(), "ether");
}

function hashTwoStrings(string1, string2) {
    return ethers.utils.solidityKeccak256(['string', 'string'], [string1, string2]);
}

function hashOneStrings(string1) {
    return ethers.utils.solidityKeccak256(['string'], [string1]);
}

deployContracts();
//analyseLogs();