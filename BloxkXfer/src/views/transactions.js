import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faPaperPlane, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "components/Auth";
import {
  Button,
  Table,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import Switch from "react-switch";
import '../assets/css/transactions.css'
const deployedPhoneContractAddress = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
const deployedUSDTContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const deployedUSDCContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const deployedDAIContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";


function TransactionsList() {
    const[transactionsData, setTransactionsData] = useState();
    const[checkedToggle, setCheckedToggle] = useState(true);
    const[escrowData, setEscrowData] = useState();
    const [phoneNumbers, setPhoneNumbers] = useState({});
    const [loading, setLoading] = useState(true);
    const [escrowLoading, setEscrowLoading] = useState(true);
    const auth = useAuth();

    async function fetchPhoneNumbers(transactions) {
      const newPhoneNumbers = { ...phoneNumbers };
      for (const transaction of transactions) {
        if (!newPhoneNumbers[transaction.sender]) {
          newPhoneNumbers[transaction.sender] = await getPhoneNumberFromPubKey(transaction.sender);
        }
        if (!newPhoneNumbers[transaction.receiver]) {
          newPhoneNumbers[transaction.receiver] = await getPhoneNumberFromPubKey(transaction.receiver);
        }
      }
      setPhoneNumbers(newPhoneNumbers);
    }

    async function fetchPhoneNumbersForEscrow(transactions) {
      for (const transaction of transactions) {
        console.log(transaction);
        if (!phoneNumbers[transaction.sender]) {
          const phoneNumber = await getPhoneNumberFromPubKey(transaction.sender);
          setPhoneNumbers((prevPhoneNumbers) => ({
            ...prevPhoneNumbers,
            [transaction.sender]: phoneNumber,
          }));
        }
      }
    }  


    const tokenAddresses = {
      [deployedUSDTContractAddress]: "USDT",
      [deployedUSDCContractAddress]: "USDC",
      [deployedDAIContractAddress]: "DAI"
    };
    

    useEffect(() => {
        const fetchTransactionsData = async () => {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(accounts[0]);
            const baseUrl = 'http://localhost:3000';
            const response = await axios.get(`${baseUrl}/api/transactions/${signer._address}`);
            setTransactionsData(response.data);
            console.log(transactionsData);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
        const fetchEscrowData = async () => {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner(accounts[0]);
          const baseUrl = 'http://localhost:3000';
          axios.get(`${baseUrl}/api/escrow`, {
                  params: {
                    addr: signer._address
                  }
                })
                .then(response => {
                  setEscrowData(response.data);
                })
                .catch(error => {
                  console.error('Error:', error.message);
              });
          }
        fetchTransactionsData();
        fetchEscrowData();
      },[]);


      useEffect(() => {
        if (transactionsData) {
          (async () => {
            await fetchPhoneNumbers(transactionsData.receivedTransactions);
            await fetchPhoneNumbers(transactionsData.sentTransactions);
            setLoading(false);
          })();
        }

        if (escrowData) {
          (async () => {
            await fetchPhoneNumbersForEscrow(escrowData.sentEscrow.fullfilled);
            await fetchPhoneNumbersForEscrow(escrowData.sentEscrow.pending);
            setEscrowLoading(false);
          })(); 
        }
      }, [transactionsData, escrowData]);

      if(loading)
        {
          return (
          <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden"></span>
          </div>
        </div>)
        }

      function handleChange()
      {
        setCheckedToggle(!checkedToggle)
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

  return (
    <> 
    {transactionsData ? 
    (<>
      <Table>
        <thead>
          <tr>
            <th>Type</th>
            <th>TransactionID</th>
            <th>Date</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Token</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          
          {transactionsData ? transactionsData.sentTransactions.map((transaction) => 
          (
                <tr className="success" key={transaction.transactionNo}>
                    <td style={{width:'2px'}}><FontAwesomeIcon icon={faPaperPlane} style={{ color: 'red' }} className="mr-4 sent-trans" /></td>
                    <td className="text-center">{transaction.transactionNo}</td>
                    <td>{transaction.date.split(' ')[0]}</td>
                    <td>{phoneNumbers[transaction.sender]}</td>
                    <td>{phoneNumbers[transaction.receiver]}</td>
                    <td>{tokenAddresses[transaction.token]}</td>
                    <td>{transaction.amount}</td>
                    <td><i className="fa fa-ban" aria-hidden="true"></i></td>
                </tr>
            ))
          : "Loading"}


          {transactionsData ? transactionsData.receivedTransactions.map((transaction) => 
          (
                <tr className="success" key={transaction.transactionNo}>
                    <td style={{width:'2px'}}><FontAwesomeIcon icon={faPaperPlane} style={{ color: 'green' }} className="mr-4 sent-trans" /></td>
                    <td className="text-center">{transaction.transactionNo}</td>
                    <td>{transaction.date.split(' ')[0]}</td>
                    <td>{phoneNumbers[transaction.sender]}</td>
                    <td>{phoneNumbers[transaction.receiver]}</td>
                    <td>{tokenAddresses[transaction.token]}</td>
                    <td>{transaction.amount}</td>
                    <td><i className="fa fa-ban" aria-hidden="true"></i></td>
                </tr>
            ))
          : "Loading"}


          {escrowData ? escrowData.sentEscrow.pending.map((escrowRequest) => 
          (
                <tr key={escrowRequest.transactionNo}>
                    <td style={{width:'2px'}}><FontAwesomeIcon icon={faPaperPlane} style={{ color: 'green' }} className="mr-4 sent-trans" /></td>
                    <td className="text-center">{escrowRequest.transactionNo}</td>
                    <td>{escrowRequest.date.split(' ')[0]}</td>
                    <td>{auth.mobileNumber}</td>
                    <td>NA</td>
                    <td>{tokenAddresses[escrowRequest.token]}</td>
                    <td>{escrowRequest.amount}</td>
                    <td className="td-actions">
                    <OverlayTrigger
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        overlay={<Tooltip id="tooltip-255158527">Cancel Request</Tooltip>}
                    >
                        <Button
                        className="btn-link btn-xs"
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        variant="danger"
                        >
                        <i className="fas fa-times"></i>
                        </Button>
                    </OverlayTrigger>
                    </td>
                </tr>
            ))
          : "Loading"}

        </tbody>
      </Table></>):("Loading")}
    </>
  )
}
export default TransactionsList;
