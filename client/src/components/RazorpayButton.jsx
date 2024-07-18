import { useEffect, useRef } from 'react';

const RazorpayButton = ({ productId }) => {
  const formRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', productId);
    script.async = true;

    formRef.current.appendChild(script);

    return () => {
      if (formRef.current) {
        formRef.current.removeChild(script);
      }
    };
  }, [productId]);

  return <form ref={formRef} />;
};

export default RazorpayButton;