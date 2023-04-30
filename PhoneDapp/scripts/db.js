const { encrypt, decrypt} = require('./encryption');
const { ThirdwebStorage } = require("@thirdweb-dev/storage");
require('dotenv').config();
const keyHex = process.env.SECRET_ENCRYPTION_KEY;

//It is better to store publicKey(as Key) => encrypted Phone number(because front end has easy access to public key, but ) 
testStorage = async () => 
{
    const storage = new ThirdwebStorage();
    
    console.log(keyHex)
    let encryptedMapping = 
    {
    };

    let encryptedPhNumber = encrypt('+919176029790', keyHex);
    console.log(encryptedPhNumber);
    encryptedMapping[1] = encryptedPhNumber;
    let uri = await storage.upload(encryptedMapping);

    let data = await storage.downloadJSON(uri);
    console.log("Actual data:  ")
    console.log(data);
    encryptedPhNumber = decrypt(data[1], keyHex);


    data[encryptedPhNumber] = keyHex;
    uri = await storage.upload(data);
    data = await storage.downloadJSON(uri);
    console.log("Actual data:  ")
    console.log(data);

}