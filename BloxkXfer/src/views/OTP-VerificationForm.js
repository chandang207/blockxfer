import { Button, Form, Dropdown, Modal, Card, InputGroup, FormControl } from "react-bootstrap";
import '../../src/assets/css/otp.css';
import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faCheck} from "@fortawesome/free-solid-svg-icons";
import OtpInput from 'react-otp-input';
import { useAuth } from "components/Auth";
import { Redirect } from "react-router-dom";
import { ethers } from "ethers";
import {NotificationContainer, NotificationManager} from 'react-notifications';


function OTPVerifyForm() {
    const [otpValue, setOtpValue] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const auth = useAuth();

    function setOtp(value)
    {
        setOtpValue(value);
    }
  

    async function savePhToPubMapping() {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(accounts[0]);

        const params = `pubKey=${encodeURIComponent(signer._address)}&phNum=${encodeURIComponent(auth.mobileNumber)}`;
        console.log('same mapping: ',params)

        const response = await fetch('http://localhost:3000/api/phoneNumber', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: params,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.text();
        console.log(data);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    }



    async function verifyOTP()
    {
      //auth.setMobileNumberAuth(0); //FOR NAVIGATING BACK TO THE MOBILE NUMBER INPUT PAGE
      /* REMOVE THE BELOW THREE LINES TO ENABLE THE ACTUAL OTP */
      auth.setMobileInput(2);
      setOtpVerified(true);
      savePhToPubMapping();
      NotificationManager.success('OTP Successfully verified');
      return;
      const url = `http://localhost:3000/verify-otp?phNum=${auth.mobileNumber}&otpCode=${otpValue}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        if (!response.ok) {
          auth.setMobileInput(0);
          throw new Error(`HTTP error ${response.status}`);
        }

        /*if (response.ok) {
          auth.setMobileInput(2);
          //<Redirect to="login" />;
        }
        else{
          alert("Error")
          auth.setMobileInput(0);
        }
        const data = await response.text();*/
        
        auth.setMobileInput(2);
        setOtpVerified(true);
        savePhToPubMapping();
        NotificationManager.success('OTP Successfully verified');
      } catch (error) {
        console.error('Error:', error.message);
      }
    }

      return (
        <>
        {!otpVerified ? (
        <Card className="registration-card-otp">
          {/*<Button className="back-btn-otp" onClick={goBack}><FontAwesomeIcon icon={faBackward} className="mr-1" /> Back</Button>*/}
            <OtpInput
            inputStyle="otpVerifySec"
            value={otpValue}
            onChange={setOtp}
            numInputs={6}
            renderSeparator={<span style={{color:'white'}}> - </span>}
            renderInput={(props) => <input {...props} />}
            />

        <Button variant="primary" type="submit" className="paymentSubmit-otp" onClick={verifyOTP}>
            <FontAwesomeIcon icon={faCheck} className="mr-3" />Verify</Button>
        </Card>) : (<Redirect to="payment" />) }
        <NotificationContainer/>
        </>
      );
}

export default OTPVerifyForm;