import { useContext, useEffect, useState } from "react"
import {
    PaymentElement,
    useStripe,
    useElements,
  } from "@stripe/react-stripe-js";

  interface PayButtonProps {
    // Define the type for the onClick function// Define the type for the disabled state
    amount: any; // If you need to display the amount
    currency: any;
    value: any;
}

const paymentElementOptions:any = {
    layout: "tabs"
  }

const PayButton: React.FC<PayButtonProps> = ({amount, currency, value }) => {
    const [error, setError] = useState("")
    const [status, setStatus] = useState("")
    
    const stripe = useStripe();
    const elements = useElements();
    value = elements

    useEffect(() => {
      if (!stripe) {
        return;
      }
  
      const clientSecret = new URLSearchParams(window.location.search).get(
        "payment_intent_client_secret"
      );
  
      if (!clientSecret) {
        return;
      }
  
      stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
        if (!paymentIntent) {
          return;
        }
  
        setStatus(paymentIntent.status);
      });
    }, [stripe])

    async function completePayment(e:any) {
        e.preventDefault()
        setError("Success")
        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
          }

          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              // Make sure to change this to your payment completion page
              return_url: "http://localhost:3000/payment/mastercard-cash-payment",
            },
          });

          if (error.type === "card_error" || error.type === "validation_error") {
            console.log(error.message)
          } else {
            console.log("Unexpected error.")
          }
    }

    return (
        <form id="payment-form" className="flex flex-col mt-4 w-full gap-2">
            <div className="text-white">{status}</div>
            <div>{error}</div>
            <PaymentElement id="payment-element" options={paymentElementOptions} />
            <button disabled={!stripe} className="bg-[#e96969] border-2 border-red-300 rounded-sm w-full p-1 mt-4 shadow-inner shadow-red-500 text-white text-sm py-2 hover:shadow-red-600" onClick={completePayment} value={value}>Pay {currency}{amount}</button>
            <div className="text-white mx-auto text-sm">Or</div>
            <button className="text-white text-sm px-2 p-1 bg-red-600 rounded-sm m-1 mx-auto shadow-inner shadow-red-800 border-2 border-red-500">Cancel</button>
            {error && <div>Test</div>}
        </form>
    )
}

export default PayButton;