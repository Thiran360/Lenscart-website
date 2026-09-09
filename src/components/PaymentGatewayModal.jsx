import React, { useState, useEffect } from 'react';
import './PaymentGatewayModal.css';

const PaymentGatewayModal = ({ isOpen, amount, method, onSuccess, onCancel }) => {
  const [step, setStep] = useState(0); // 0: init, 1: processing, 2: success

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      
      const timer1 = setTimeout(() => {
        setStep(1);
      }, 1500);

      const timer2 = setTimeout(() => {
        setStep(2);
      }, 4000);

      const timer3 = setTimeout(() => {
        onSuccess();
      }, 5500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="pg-overlay">
      <div className="pg-modal">
        <div className="pg-header">
          <div className="pg-merchant">
            <span className="pg-merchant-logo">L</span>
            <div>
              <h3>Mr.LensMaker</h3>
              <p>Transaction ID: LK{Math.floor(100000000 + Math.random() * 900000000)}</p>
            </div>
          </div>
          <div className="pg-amount">
            ₹{amount.toFixed(2)}
          </div>
        </div>

        <div className="pg-body">
          {step === 0 && (
            <div className="pg-status-box">
              <div className="pg-spinner"></div>
              <h4>Initiating Secure Connection...</h4>
              <p>Please do not close this window or press back</p>
            </div>
          )}

          {step === 1 && (
            <div className="pg-status-box">
              <div className="pg-spinner pulse"></div>
              <h4>{method === 'gpay' ? 'Waiting for UPI App...' : 'Processing Payment with Bank...'}</h4>
              <p>{method === 'gpay' ? 'Open Google Pay on your phone to authorize.' : 'Authenticating your details securely.'}</p>
            </div>
          )}

          {step === 2 && (
            <div className="pg-status-box success">
              <div className="pg-check-circle">
                <span className="pg-checkmark">✓</span>
              </div>
              <h4>Payment Successful!</h4>
              <p>Redirecting to merchant...</p>
            </div>
          )}
        </div>

        <div className="pg-footer">
          <div className="pg-secure-badge">
            🔒 128-bit SSL Secure Payment
          </div>
          {step < 2 && (
            <button className="pg-cancel-btn" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewayModal;
