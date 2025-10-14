import React, { useEffect, useState } from "react";
import { supabase } from "../API/supabaseClient";
import '../CSS/hok.css'

function HeadOfKitchen() {
    //check for password
    const [formVisible, setFormVisible] = useState(true)
    //FETCHING FROM DATABASE
    const [orders, setOrders] = useState([]);
    const [expandedOrders, setExpandedOrders] = useState({});
    const[itemsByOrder, setItemsByOrder] = useState({});
    const [paidPaypal, setPaidPaypal] = useState ({}) //check if user paid with PayPal
    //CHECKS IF THE HOK PASSWORD IS SET
    useEffect(() =>{
      const storedHokPassword = sessionStorage.getItem('hokPassword');
      if(storedHokPassword === 'h4h'){
        setFormVisible(false)
        fetchOrders()//FETCH THE ORDERS if PASSWORD CREDENTIALS IS MET
      }
    }, []);
    //END CHECKS IF THE HOK PASSWPRD IS SET
    //START FETCHORDER
    const fetchOrders = async (e) =>{
      const { data, error } = await supabase
        .from("order")
        .select("order_no, customer_id, customer(name), paid_with_paypal")
        //.gt("order_date", "2025-09-15")

      if(error){
        console.error("Error fetching orders:", error.message)
      }else{
        setOrders(data || []);

        //CHECK PAYPAL STATUS UPON FETCHING ORDERS
        const paypalStatus = {};
        data.forEach(order => {
          paypalStatus[order.order_no] = !!order.paid_with_paypal;
        });
        setPaidPaypal(paypalStatus);
      }
    };
    //END FETCHORDER

    //VALIDATES HOK PASSWORD BEFORE ALLOWING FORM VIEW
    const handleSubmit = (e) => {
      e.preventDefault(); // prevent page reload
      const hokPassword = e.target.hokPassword.value;

      if (hokPassword === 'h4h') {    //store user session
        sessionStorage.setItem('hokPassword', hokPassword);
        setFormVisible(false)
        fetchOrders();
      } else {
        alert("incorrect password")
      }
    };
    //END VALIDATE HOK PASSWORD BEFORE ALLOWING FORM VIEW

    //TOGGLE ORDER EXPANSION AND FETCH ITEMS IF NOT ALREADY LOADED
    const toggleItems = async (orderNo) => {
      const isExpanded = expandedOrders[orderNo];
      
      if(isExpanded){
        //collapse
        setExpandedOrders((prev) => ({...prev, [orderNo]: false}));
      }else{
        //expand
        if(!itemsByOrder[orderNo]){
          const { data, error } = await supabase
            .from("items")
            .select("*")
            .eq("order_no", orderNo);

            if(error){
              console.error("Error fetching items:", error.message);
            }else{
              setItemsByOrder((prev) => ({...prev, [orderNo]: data}));
            }
        }
        /*
        //CHECK IF PAID WITH PAYPAL
        if(!(orderNo in paidPaypal)){
          const { data,error } = await supabase
            .from('order')
            .select('*')
            .eq('order_no' , orderNo)
            .not('paid_with_paypal' , 'is', false)
 
          if(error){
            console.log('Cannot verify PayPal payment for ${orderNo} ', error.message)
          }else{
            setPaidPaypal((prev) => ({...prev, [orderNo]: data && data.length > 0}))
          }
        }
        */
        setExpandedOrders((prev) => ({...prev, [orderNo]: true}));
      }
    };
  return(
    <>
      <img className='hoklogo' src='/IMAGES/BattleAxeCafeLogo.png'></img>
     <hr className="hr" />
      {formVisible && (
        <form name="hokForm" className="hokForm" onSubmit={handleSubmit}>
          <h2>PLEASE ENTER THE PASSWORD</h2>
          <input className="hokPassword" type="text" name="hokPassword"/>
          <button>View Orders</button>
        </form>
      )}
      {!formVisible && (
      <div id="viewOrder"> 
        <h3>THIS WEEKS ORDERS</h3>
        <table className="orderTable">
          <thead>
            <tr>
              <th>ORDER#</th>
              <th>NAME</th>
              <th>VIEW ITEMS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) =>(
              <React.Fragment key={order.order_no}>
                <tr style={{ color: paidPaypal[order.order_no] ? 'green' : 'black' }}>
                  <td>{order.order_no}</td>
                  <td>{order.customer?.name || "Unknown"}</td>
                  <td>
                    <button className="viewOrdersButton" onClick={() => toggleItems(order.order_no)}style={{ backgroundColor: paidPaypal[order.order_no] ? 'green' : '#BA9D55', color: paidPaypal[order.order_no] ? 'white' : 'black' }}>
                      {expandedOrders[order.order_no]
                        ? "HIDE ITEMS"
                        : "VIEW ITEMS IN THIS ORDER"
                      }
                    </button>
                  </td>
                </tr>
                {expandedOrders[order.order_no] && (
                  <tr>
                    <td colSpan={3} style={{ color: paidPaypal[order.order_no] ? 'green' : 'black'}}>
                      <ul>
                        {
                          itemsByOrder[order.order_no]?.map((item, idx) => (
                            <li className="item" key={idx} style={{ color: paidPaypal[order.order_no] ? 'green' : 'black'}}>
                              {item.order_name} - Qty: {item.quantity} Price: ${item.price * item.quantity}
                            </li>
                          )) || <li>Loading...</li>
                        }
                      </ul>
                        {
                          paidPaypal[order.order_no] 
                          ? `$${itemsByOrder[order.order_no]?.reduce((acc, item) => acc + (item.price * item.quantity), 0)} PAID WITH PAYPAL` 
                          : `Total: $${itemsByOrder[order.order_no]?.reduce((acc, item) => acc + (item.price * item.quantity), 0)}`
                        }
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </>
  )
}

export default HeadOfKitchen;
