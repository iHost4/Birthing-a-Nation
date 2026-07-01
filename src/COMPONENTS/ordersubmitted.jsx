import { supabase } from "../API/supabaseClient";
import { useState } from "react";
import '../CSS/ordersubmitted.css'
import PayPalCheckout from "../API/paypalAPI";

function OrderSubmitted({orderNo, quantity, onClose}){
    if(!orderNo) return null
    return(
        <div id="submittedPopUp">
            <h2>ORDER SUBMITTED SUCCESSFULLY</h2>
            <p>Your order # {orderNo}</p>
            <p>{quantity}</p>
            <button className="closeButton" onClick={onClose}>C L O S E</button>
         
            {/* 
            <PayPalCheckout orderNo={orderNo}/>
            */}
        </div>
    );
};
export default OrderSubmitted;