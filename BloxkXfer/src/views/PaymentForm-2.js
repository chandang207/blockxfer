import { Button, Form, Dropdown, Modal, Card, InputGroup, FormControl } from "react-bootstrap";
import '../../src/assets/css/payment.css';
import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faPaperPlane, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import PhoneInput from 'react-phone-number-input';
import { ethers } from "ethers";
const { utils } = require("ethers");
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
const phoneContractABI = require('../abi/phoneContractABI.json')
const tokenContractABI = require('../abi/tokenContractABI.json')
const deployedPhoneContractAddress = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
const deployedUSDTContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const deployedUSDCContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const deployedDAIContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

function PaymentForm2({closeForm, action}) {
  console.log("Received action:   ", action);
  const [mobileNumber, setMobileNumber] = useState("+9191760 29790");
  const [asset, setAsset] = useState({displayName: '', address: ''});
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);


    function goBack()
    {
        closeForm();
    }

    function removeSpaces(str) {
      const trimmedStr = str.trim();
      const noSpacesStr = trimmedStr.replace(/\s+/g, '');
      return noSpacesStr;
    }

    async function getPhoneNumberFromPubKey(pubKey)
      {
        try {
          const baseUrl = 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/getPhoneNumber/${pubKey}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log(response)
          if(response.ok)
          {
            return await response.text();
          }
          else{
            console.log("error");
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        return pubKey;
      }

      async function getPubKeyFromPhoneNumber()
      {
        try {
          const baseUrl = 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/getPublicKey/${removeSpaces(mobileNumber)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log(response)
          if(response.ok)
          {
            return await response.text();
          }
          else{
            console.log("error");
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        return pubKey;
      }

    const checkIfMappingIsPresent = async () => 
    {
        try {
          const baseUrl = 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/getPublicKey/${removeSpaces(mobileNumber)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log(response)
          if(response.ok)
          {
            console.log(response.data);
            return true;
          }
          else{
            console.log("error");
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        return false;
      }

    const approveAllowance = async (tokenContract, phoneContract, tokens) => {
      try {
        const gasPrice = ethers.utils.parseUnits("5", "gwei");
        const gasLimit = 60000;
        const tx = await tokenContract.approve(phoneContract.address, tokens,
          {
            gasPrice: gasPrice,
            gasLimit: gasLimit,
          });
        await tx.wait();
        console.log("Allowance approved");
      } catch (error) {
        console.error("Error approving allowance:", error);
      }
    };
  
    const transferTokens = async (
      phoneContract,
      recipient,
      tokenContractAddress,
      tokens
    ) => {
      try {
        const gasPrice = ethers.utils.parseUnits("5", "gwei");
        const gasLimit = 500000;
        const tx = await phoneContract.transferTokens(
          recipient,
          tokenContractAddress,
          tokens,
          {
            gasPrice: gasPrice,
            gasLimit: gasLimit,
          }
        );
        await tx.wait();
        console.log("Payment Transaction sent:", tx.hash);
      } catch (error) {
        console.error("Error transferring tokens:", error);
      }
    };

    const requestTokens = async (
      phoneContract,
      from,
      recipient,
      tokenContractAddress,
      tokens
    ) => {
      try {
        const gasPrice = ethers.utils.parseUnits("5", "gwei");
        const gasLimit = 500000;
        const tx = await phoneContract.requestPayment(
          recipient,
          from,
          tokenContractAddress,
          tokens,
          {
            gasPrice: gasPrice,
            gasLimit: gasLimit,
          }
        );
        await tx.wait();
        console.log("Request transaction sent:", tx.hash);
      } catch (error) {
        console.error("Error Requesting tokens:", error);
      }
    };

    //unregisteredReceiver should be hash of (encrypted phone string)
    const escrowTokens = async (
      phoneContract,
      unregisteredReceiver,
      tokenContractAddress,
      tokens
    ) => {
      try {
        console.log(`encrypted str::     ${unregisteredReceiver}`)
        const gasPrice = ethers.utils.parseUnits("5", "gwei");
        const gasLimit = 500000;
        const tx = await phoneContract.sendEcrowPayment(
          unregisteredReceiver,
          tokenContractAddress,
          tokens,
          {
            gasPrice: gasPrice,
            gasLimit: gasLimit,
          }
        );
        await tx.wait();
        console.log("Escrow transaction sent:", tx.hash);
      } catch (error) {
        console.error("Error Escrowing tokens:", error);
      }
    };




    /**DECRYPTED 
     * 
     * try {
          const baseUrl = 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/decrypt/${encryptedStr}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log(response)
          if(response.ok)
          {
            console.log(await response.text());
          }
          else{
            console.log("error");
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
     */

    const initiatePaymentTransfer = async () => {
        console.log("Initiating transfer");
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const receipientAddress = await getPubKeyFromPhoneNumber();
        console.log(`send receipientAddress   ${receipientAddress}`);
    
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(accounts[0]);
        console.log(signer._address)
        const phoneContract = new ethers.Contract(deployedPhoneContractAddress, phoneContractABI, signer);
        const tokenContract = new ethers.Contract(asset.address, tokenContractABI, signer);
        const tokens = ethers.utils.parseUnits(amount, 18);
        //console.log(ethers.utils.formatUnits(await tokenContract.allowance(await signer.getAddress(), '0xBBA13a375b2E9a4d79ed8A8f0FB2313A335B463c'), 6));
        await approveAllowance(tokenContract, phoneContract, tokens);
        await transferTokens(phoneContract, receipientAddress, asset.address, tokens)
      };

      const initiatePaymentRequest = async () => {
        console.log("Initiating request");
        
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const receipientAddress = await getPubKeyFromPhoneNumber();
        console.log(`request receipientAddress   ${receipientAddress}`);
    
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(accounts[0]);
        console.log(signer._address)
        const phoneContract = new ethers.Contract(deployedPhoneContractAddress, phoneContractABI, signer);
        const tokenContract = new ethers.Contract(asset.address, tokenContractABI, signer);
        const tokens = ethers.utils.parseUnits(amount, 18);
        //console.log(ethers.utils.formatUnits(await tokenContract.allowance(await signer.getAddress(), '0xBBA13a375b2E9a4d79ed8A8f0FB2313A335B463c'), 6));
        await requestTokens(phoneContract, signer._address, receipientAddress, tokenContract.address, tokens)
      };

      const initiatePaymentEscrow = async () => {
        console.log("Initiating escrow");
        let encryptedStr;
        let decryptedStr;
        try {
          const baseUrl = 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/encrypt/${removeSpaces(mobileNumber)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if(response.ok)
          {
            encryptedStr = await response.text();
          }
          else{
            console.log("error");
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(accounts[0]);
        const phoneContract = new ethers.Contract(deployedPhoneContractAddress, phoneContractABI, signer);
        const tokenContract = new ethers.Contract(asset.address, tokenContractABI, signer);
        const tokens = ethers.utils.parseUnits(amount, 18);
        //console.log(ethers.utils.formatUnits(await tokenContract.allowance(await signer.getAddress(), '0xBBA13a375b2E9a4d79ed8A8f0FB2313A335B463c'), 6));
        await approveAllowance(tokenContract, phoneContract, tokens);
        await escrowTokens(phoneContract, encryptedStr, tokenContract.address, tokens);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if(!asset)
        {
          NotificationManager.error('Please select an asset', 'You missed out filling all the required fields!');
          return;
        }
        if(!amount || amount <= 0)
        {
          NotificationManager.error('Amount value should be greater than 0', 'Invalid amount value!');
          return;
        }
        console.log("Starting transaction:   ",action)
        if(action.toString().includes('Send'))
        {
          const userRegistered = await checkIfMappingIsPresent();
          if(userRegistered)
          {
            initiatePaymentTransfer();
          }
          else{
            alert("This user is not registered in the platform, the funds will be escrowed and will be available for the user to claim.");
            initiatePaymentEscrow();
          }
        }
        else
        {
          const isUserRegistered = await checkIfMappingIsPresent();
          if(isUserRegistered)
          {
            initiatePaymentRequest();
          }
          else{
            alert("Cannot request payment from unregistered users.");
          }
        }
      };
    
      const handleModalClose = () => setShowModal(false);
      const handleModalShow = () => setShowModal(true);
    
      const handleAssetSelect = (displayName, address) => {
        setAsset({ displayName , address });
        handleModalClose();
      };
      return (
        
        <Card className="registration-card">
          <Button className="back-btn" onClick={goBack}><FontAwesomeIcon icon={faBackward} className="mr-1" /> Back</Button>
          <Form onSubmit={handleSubmit} className="paymentForm">
            <Form.Group>
            <Form.Label>Mobile Number</Form.Label>
              <PhoneInput
                defaultCountry="US"
                value={mobileNumber}
                onChange={setMobileNumber}
                className="phoneInp"
                useNationalFormatForDefaultCountryValue={false}
                addInternationalOption={false}
                placeholder=""/>
            </Form.Group>
    
            <Form.Group>
            <Form.Label>Select an Asset</Form.Label>
              <Button className="chooseBtn" variant="outline-primary" onClick={handleModalShow}>
                {asset.displayName || "SELECT"}
              </Button>
              <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header>
                  <Modal.Title>Select an Asset</Modal.Title>
                  <Button type="button" onClick={handleModalClose} className="btn-close" aria-label="Close">X</Button>
                </Modal.Header>
                <Modal.Body>
                  <Button onClick={() => handleAssetSelect("USDT", deployedUSDTContractAddress)}>
                   USDT
                  </Button>
                  <Button onClick={() => handleAssetSelect("USDC", deployedUSDCContractAddress)}>
                    USDC
                  </Button>
                  <Button onClick={() => handleAssetSelect("DAI", deployedDAIContractAddress)}>
                    DAI
                  </Button>
                </Modal.Body>
              </Modal>
            </Form.Group>
    
            <Form.Group>
              <Form.Label>Amount</Form.Label>
              <FormControl
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </Form.Group>
    
            <Button variant="primary" type="submit" className="paymentSubmit">
              {action.toString().includes('Send') ? 
              <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
              :
              <FontAwesomeIcon icon={faArrowDown} className="mr-1" />}
            {action}</Button>
          </Form>
        </Card>
      );
}

export default PaymentForm2;