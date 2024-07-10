const RazorpayButton = ({ productId }) => {
  return (
    <form>
        <script src="https://checkout.razorpay.com/v1/payment-button.js" data-payment-button-id={productId} async></script>
    </form>
  );
};

export default RazorpayButton;