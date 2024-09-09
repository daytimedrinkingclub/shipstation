  import React, { useContext } from 'react';
  import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
  import { AuthContext } from "../context/AuthContext";

  const PaypalButton = ({ productId, amount }) => {
    const { user } = useContext(AuthContext);
    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID
    
    const createOrder = (data, actions) => {
      return actions.order.create({
        purchase_units: [
          {
            reference_id: productId,
            amount: {
              value: amount,
            },
            custom_id: user.email,
          },
        ],
      });
    };  

    const onApprove = (data, actions) => {
      return actions.order.capture()
    };

    return (
      <PayPalScriptProvider options={{ clientId: paypalClientId }}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </PayPalScriptProvider>
    );
  };

  export default PaypalButton;