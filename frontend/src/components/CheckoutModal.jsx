import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CheckoutModal = ({ appointmentDetails, onPaymentSuccess, onClose, currentLang = 'en' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('stripe'); // stripe or razorpay
  const [razorpayMethod, setRazorpayMethod] = useState('upi'); // upi or card
  const [upiId, setUpiId] = useState('');

  const TRANSLATIONS = {
    en: {
      title: "Secure Payment Checkout",
      payee: "Consultation Fee:",
      doctor: "Attending Specialist:",
      date: "Schedule Slot:",
      amount: "₹500.00",
      btnPay: "Pay & Confirm Booking",
      btnCancel: "Cancel Booking",
      stripeLabel: "Stripe Checkout (Card)",
      razorpayLabel: "Razorpay Checkout (UPI/Card)",
      cardNumPlaceholder: "1234 5678 9012 3456",
      expiryPlaceholder: "MM/YY",
      cvvPlaceholder: "CVV",
      processing: "Processing secure payment, please wait...",
      success: "Payment processed successfully!",
      paymentMethodLabel: "Select Razorpay Payment Option",
      methodUPI: "UPI Payment",
      methodCard: "Debit/Credit Card",
      upiIdLabel: "UPI Address / VPA ID",
      upiPlaceholder: "e.g., username@upi",
      invalidUpi: "Please enter a valid UPI address (e.g., username@bank)"
    },
    hi: {
      title: "सुरक्षित भुगतान चेकआउट",
      payee: "परामर्श शुल्क:",
      doctor: "चिकित्सक विशेषज्ञ:",
      date: "निर्धारित स्लॉट:",
      amount: "₹500.00",
      btnPay: "भुगतान करें और बुकिंग की पुष्टि करें",
      btnCancel: "बुकिंग रद्द करें",
      stripeLabel: "स्ट्राइप चेकआउट (कार्ड)",
      razorpayLabel: "रेजरपे चेकआउट (UPI/कार्ड)",
      cardNumPlaceholder: "1234 5678 9012 3456",
      expiryPlaceholder: "माह/वर्ष",
      cvvPlaceholder: "सीवीवी",
      processing: "सुरक्षित भुगतान संसाधित किया जा रहा है, कृपया प्रतीक्षा करें...",
      success: "भुगतान सफलतापूर्वक संसाधित किया गया!",
      paymentMethodLabel: "रेजरपे भुगतान विकल्प चुनें",
      methodUPI: "यूपीआई भुगतान",
      methodCard: "डेबिट/क्रेडिट कार्ड",
      upiIdLabel: "यूपीआई पता / वीपीए आईडी",
      upiPlaceholder: "जैसे, username@upi",
      invalidUpi: "कृपया एक मान्य यूपीआई पता दर्ज करें (जैसे, username@bank)"
    },
    te: {
      title: "సురక్షిత చెల్లింపు చెకౌట్",
      payee: "సంప్రదింపు రుసుము:",
      doctor: "హాజరయ్యే నిపుణుడు:",
      date: "షెడ్యూల్ స్లాట్:",
      amount: "₹500.00",
      btnPay: "చెల్లించండి & బుకింగ్ నిర్ధారించండి",
      btnCancel: "బుకింగ్ రద్దు చేయి",
      stripeLabel: "స్ట్రైప్ చెకౌట్ (కార్డ్)",
      razorpayLabel: "రేజర్‌పే చెకౌట్ (UPI/కార్డ్)",
      cardNumPlaceholder: "1234 5678 9012 3456",
      expiryPlaceholder: "నెల/సంవత్సరం",
      cvvPlaceholder: "సీవీవీ",
      processing: "సురక్షిత చెల్లింపు ప్రాసెస్ చేయబడుతోంది, దయచేసి వేచి ఉండండి...",
      success: "చెల్లింపు విజయవంతంగా పూర్తయింది!",
      paymentMethodLabel: "రేజర్‌పే చెల్లింపు విధానాన్ని ఎంచుకోండి",
      methodUPI: "యూపీఐ చెల్లింపు",
      methodCard: "డెబిట్/క్రెడిట్ కార్డ్",
      upiIdLabel: "యూపీఐ చిరునామా / వీపీఏ ఐడీ",
      upiPlaceholder: "ఉదాహరణకు, username@upi",
      invalidUpi: "దయచేసి సరైన యూపీఐ చిరునామాను నమోదు చేయండి (ఉదా, username@bank)"
    }
  };

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handlePayment = (e) => {
    e.preventDefault();
    
    if (paymentGateway === 'razorpay' && razorpayMethod === 'upi') {
      const upiPattern = /^[\w.-]+@[\w.-]+$/;
      if (!upiPattern.test(upiId)) {
        toast.error(t.invalidUpi);
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate payment authorization processing
    setTimeout(() => {
      setIsProcessing(false);
      const transactionId = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      toast.success(t.success);
      onPaymentSuccess(transactionId, 500.00);
    }, 2000);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11,18,32,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110 }}>
      <div className="glass-card" style={{ padding: '2.5rem', width: '90%', maxWidth: '460px', background: 'var(--white)', border: '1.5px solid var(--border)' }}>
        <h2 className="serif-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--ink)', textAlign: 'center' }}>
          🛡️ {t.title}
        </h2>

        {isProcessing ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="skeleton-line" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: 'var(--ink)', fontWeight: '600' }}>{t.processing}</p>
          </div>
        ) : (
          <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* Booking Details Summary */}
            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ink-soft)' }}>{t.doctor}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{appointmentDetails.doctorName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ink-soft)' }}>{t.date}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{appointmentDetails.date} @ {appointmentDetails.slot}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{t.payee}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--sky-dark)' }}>{t.amount}</span>
              </div>
            </div>

            {/* Gateway Toggle Selector */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setPaymentGateway('stripe')}
                style={{ 
                  flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer',
                  border: paymentGateway === 'stripe' ? '1.5px solid var(--sky)' : '1px solid var(--border)',
                  background: paymentGateway === 'stripe' ? 'var(--sky-pale)' : 'var(--white)',
                  color: paymentGateway === 'stripe' ? 'var(--sky-dark)' : 'var(--ink-soft)'
                }}
              >
                💳 {t.stripeLabel}
              </button>
              <button 
                type="button"
                onClick={() => setPaymentGateway('razorpay')}
                style={{ 
                  flex: 1, padding: '10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer',
                  border: paymentGateway === 'razorpay' ? '1.5px solid var(--mint)' : '1px solid var(--border)',
                  background: paymentGateway === 'razorpay' ? 'var(--mint-pale)' : 'var(--white)',
                  color: paymentGateway === 'razorpay' ? 'var(--mint-dark)' : 'var(--ink-soft)'
                }}
              >
                📲 {t.razorpayLabel}
              </button>
            </div>

            {/* Razorpay Sub-Selector */}
            {paymentGateway === 'razorpay' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t.paymentMethodLabel}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setRazorpayMethod('upi')}
                    style={{ 
                      flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer',
                      border: razorpayMethod === 'upi' ? '1.5px solid var(--mint)' : '1px solid var(--border)',
                      background: razorpayMethod === 'upi' ? 'var(--mint-pale)' : 'var(--white)',
                      color: razorpayMethod === 'upi' ? 'var(--mint-dark)' : 'var(--ink-soft)'
                    }}
                  >
                    ⚡ {t.methodUPI}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRazorpayMethod('card')}
                    style={{ 
                      flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer',
                      border: razorpayMethod === 'card' ? '1.5px solid var(--mint)' : '1px solid var(--border)',
                      background: razorpayMethod === 'card' ? 'var(--mint-pale)' : 'var(--white)',
                      color: razorpayMethod === 'card' ? 'var(--mint-dark)' : 'var(--ink-soft)'
                    }}
                  >
                    💳 {t.methodCard}
                  </button>
                </div>
              </div>
            )}

            {/* Conditional Rendering of Inputs */}
            {paymentGateway === 'stripe' || (paymentGateway === 'razorpay' && razorpayMethod === 'card') ? (
              <>
                {/* Card Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ink-soft)' }}>Card Number</label>
                  <input 
                    type="text"
                    required
                    maxLength="19"
                    placeholder={t.cardNumPlaceholder}
                    value={cardNumber}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      let matches = v.match(/\d{4,16}/g);
                      let match = matches && matches[0] || '';
                      let parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      if (parts.length > 0) {
                        setCardNumber(parts.join(' '));
                      } else {
                        setCardNumber(v);
                      }
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ink-soft)' }}>Expiry Date</label>
                    <input 
                      type="text"
                      required
                      maxLength="5"
                      placeholder={t.expiryPlaceholder}
                      value={expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
                        if (v.length >= 2) {
                          setExpiry(`${v.slice(0, 2)}/${v.slice(2, 4)}`);
                        } else {
                          setExpiry(v);
                        }
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ink-soft)' }}>CVV Code</label>
                    <input 
                      type="password"
                      required
                      maxLength="3"
                      placeholder={t.cvvPlaceholder}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* UPI ID Input */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--ink-soft)' }}>
                  {t.upiIdLabel}
                </label>
                <input 
                  type="text"
                  required
                  placeholder={t.upiPlaceholder}
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              </div>
            )}

            {/* Test Helper note */}
            <div style={{ fontSize: '11px', color: 'var(--ink-muted)', textAlign: 'center', margin: '4px 0' }}>
              ℹ️ Sandbox test payment mode active. Enter any fake details to authorize.
            </div>

            {/* Submit & Cancel buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="glow-button" style={{ flex: 1 }}>
                {t.btnPay}
              </button>
              <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>
                {t.btnCancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
