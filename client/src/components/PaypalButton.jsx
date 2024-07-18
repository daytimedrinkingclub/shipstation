const PaypalButton = ({ productId }) => {
  return (
    <a href={`https://www.paypal.com/ncp/payment/${productId}`} target="_blank" rel="noopener noreferrer" className="block w-full">
      <img 
        src="https://www.paypalobjects.com/webstatic/en_AU/i/buttons/btn_paywith_primary_l.png" 
        alt="Pay with PayPal" 
        className="w-full"
      />
    </a>
  );
};

export default PaypalButton;
