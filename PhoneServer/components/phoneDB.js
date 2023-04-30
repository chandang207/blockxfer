const { encrypt, decrypt} = require('./encryption');
const { ThirdwebStorage } = require("@thirdweb-dev/storage");
let { PhoneNumberPublicKeyMap } =  require('./phToPubKeyMap');
require('dotenv').config();
const keyHex = process.env.SECRET_ENCRYPTION_KEY;
let uri;
const fs = require('fs');
const path = require('path'); // Add this line to import the 'path' module
const filename = path.join(__dirname, '..', 'ipfsData', 'backup.txt'); 
const storage = new ThirdwebStorage();
let phoneNumberPublicKeyMap = new PhoneNumberPublicKeyMap();

InitCode = async() =>
{
    try {
        const backupUri = readFromFile();
        if (backupUri) {
            uri = backupUri;
            console.log(`inside  ${uri}`)
        } else {
            uri = await storage.upload(phoneNumberPublicKeyMap);
            console.log(`outside  ${uri}`)
            writeToFile(uri);
        }
    } catch (error) {
        console.error('Error initializing the uri:', error);
        uri = await storage.upload(phoneNumberPublicKeyMap);
        writeToFile(uri);
    }
}

const writeToFile = (data) => {
    fs.writeFileSync(filename, data);
  };
  
    const readFromFile = () => {
    return fs.readFileSync(filename, 'utf8');
  };

storeData = async (phNum, pubkey) => 
{
    let data = await storage.downloadJSON(uri);

    phoneNumberPublicKeyMap.encryptedPhoneToPublicKey = data.encryptedPhoneToPublicKey;
    phoneNumberPublicKeyMap.publicKeyToEncryptedPhone = data.publicKeyToEncryptedPhone;

    let encryptedPhNumber = encrypt(phNum, keyHex);
    phoneNumberPublicKeyMap.set(encryptedPhNumber, pubkey);
    uri = await storage.upload(phoneNumberPublicKeyMap);
    writeToFile(uri);
    const dataL = readFromFile();
    console.log("uploaded:  ", dataL);
    return true;
}


getPublicKey = async (phNum) => 
{
    let data = await storage.downloadJSON(readFromFile());
    const val = data.encryptedPhoneToPublicKey[encrypt(phNum, keyHex)];
    if(val)
    {
        return val;
    }
    return false; 
}


getPhNum = async (pubKey) => 
{
    let data = await storage.downloadJSON(readFromFile());
    const val = data.publicKeyToEncryptedPhone[pubKey];
    if(val)
    {
        return decrypt(val,keyHex);
    }
    return false;
}



module.exports = {storeData,InitCode, getPhNum,getPublicKey };