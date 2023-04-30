const {ethers} = require('ethers');
const phoneAbi = require('./abis/phone.json');
const { encrypt } = require('./encryption');
require('dotenv').config();
const getRequestsdata = require('./requests');
const getEscrowdata = require('./escrow');
const getTransactionsdata = require('./transactions');
const keyHex = process.env.SECRET_ENCRYPTION_KEY;

let phoneContractAddress = '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1';

getResponse = async (address, type, hash = null) => 
{
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
    const deployPhoneContract = new ethers.Contract(phoneContractAddress, phoneAbi, provider);

    /* NORMAL TRANSACTIONS - SENT/RECEIVE */
    if(type == "transactions")
    {
        return await getTransactionsdata(deployPhoneContract, address);
    }
    else if(type == "requests")
    {
        return await getRequestsdata(deployPhoneContract, address);
    }
    else if(type == "escrow")
    {
        let encryptedPhNumber = encrypt('+919176029790', keyHex);//used in resolvePhonetoPublicAddress
        let hashVal = hashOneStrings(encryptedPhNumber); //used in sendEcrowPayment

        return await getEscrowdata(deployPhoneContract, address, hash);

        /* ESCROW TRANSACTIONS - SENT REQUEST(RECEIVE IS NOT ALLOWED) */
    }
}

function hashOneStrings(string1) {
    return ethers.utils.solidityKeccak256(['string'], [string1]);
}

module.exports = getResponse;