import React, {useState} from 'react';
import OTPForm from './OTPForm';
import PaymentForm2 from './PaymentForm-2';
import '../../src/assets/css/payment.css'

const Payment = () => {

  const [showForm, setShowPaymentForm] = useState(false);
  const [action, setAction] = useState('');

  function showPaymentForm(value, action)
  {
    setAction(action);
    setShowPaymentForm(value);
  }

  return (
    <div className="container">
      <div className="centered-box">
        {!showForm ?
        <div className="button-container">
          <button className="big-button" onClick={() => showPaymentForm(true, 'Send')}>Send</button>
          <button className="big-button" onClick={() => showPaymentForm(true, 'Request')}>Request</button>
        </div>
        :
        <PaymentForm2 closeForm={() => showPaymentForm(false)} action={action}/>}
      </div>
    </div>
  );
};

export default Payment;
