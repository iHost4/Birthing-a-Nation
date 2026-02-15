import './CSS/main.css'
import Items from './COMPONENTS/items';
import { useState } from 'react';
import { supabase } from './API/supabaseClient';
import OrderSubmitted from './COMPONENTS/ordersubmitted';
import { useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
//IMPORTANT: YOU MUST CALCULATE THE ORDER TOTAL ON THE POP-UP FOR THOSE PAYING IN CASH
//THE ORDERS DATABASE MUST SHOW THE TOTAL...IT WILL CALCULATE THE ITEM PRICE * QUANTITY
function Main(){
    //THE FOLLOWING useState INPUTS THE USER INFORMATION INSIDE SUPABASE//
    const [rank, setRank] = useState('SELECT MEMBER STATUS')//
    const [name, setName] = useState('')
    const [orders, setOrders] = useState([]) //gets all the orders

    const [showPopup, setShowPopup] = useState(false)
    const [submittedOrderNo, setSubmittedOrderNo] = useState(null)//handles fetching the submitted order numbers
    //const [viewAllOrders, setViewAllOrders] = useState();
    //THE FOLLOWING useState ENSURES AT LEAST ONE ITEM HAS A QUANTITY GREATER THAN 0
    const [orderSelections, setOrderSelections] = useState({})

    //STOP SUBMISSION OF ORDERS
    const [stopOrders, setStopOrders] = useState(false);

    //SABBATH SITE SHUTDOWN
    const [isSabbath, setIsSabbath] = useState(false);
    const [noMoreOrders, setNoMoreOrders] = useState(false);
    useEffect(() => {
        const checkSabbath = () => {
            const now = new Date();

            const nowUTC = new Date();
            const nowCST = new Date(nowUTC.toLocaleString('en-US', { timezone:"America/Chicago" }));

            //gets the day and hours
            const day = nowCST.getDay();
            const hour = nowCST.getHours();
            const minute = nowCST.getMinutes();

            //check if the current time is the Sabbath: Friday 6pm - Satuday 6pm
            if(day === 5 && hour >= 18 || day === 6 && hour < 18){
                setIsSabbath(true);
            }else{
                setIsSabbath(false);
            }
            //check if the current time is 12pm Friday (this is when orders are no longer being received)
            if(day === 5 && hour >= 12 && minute >= 0 && day === 5){
                setNoMoreOrders(true);
            }else{
                setNoMoreOrders(false);
            }
        };

        // Run immediately, then every 30 seconds
        checkSabbath();
        const interval = setInterval(checkSabbath, 30 * 1000);

        return () => clearInterval(interval);
    }, []);
    //END SABBATH SITE SHUTDOWN
    useEffect(() =>{
        if(showPopup){
            document.body.style.setProperty('overflow', 'hidden', 'important')
        }else{
            document.body.style.overflow=""
        }
        return() =>{
            document.body.style.overflow=""
        }
    }, [showPopup])
    //READ AND UNDERSTAND THE CODE BELOW
    //THE FOLLOWING CODE ENSURES AT LEAST ONE ITEM HAS A QUANTITY GREATER THAN 0
    const handleOrderChange = (order_name, quantity, price) => {
        setOrders(prev => {
            const updated = prev.filter(item => item.order_name != order_name)
            if(quantity !== '0'){
                updated.push({
                    order_name,
                    quantity: parseInt(quantity),
                    price: parseFloat(price.replace('$', ''))
                })
            }
            return updated
        })
        //THE FOLLOWING CODE ENSURES AT LEAST ONE ITEM HAS A QUANTITY GREATER THAN 0
        setOrderSelections(prev => ({
            ...prev,
            [order_name]: { quantity, price }
        }));
    };
    //START OF: FORM SUBMISSION HANDLING
    const handleSubmit = async (e) => {
        e.preventDefault();

        //const statusCheck = document.querySelector('#genderRank')
        if(rank === "SELECT MEMBER STATUS"){
            console.log('Please select member status')
            alert('Please select member status')
            return
        }
        //THE FOLLOWING CODE ENSURES AT LEAST ONE ITEM HAS A QUANTITY GREATER THAN 0
        const atleastOneSelection = Object.values(orderSelections).some(
            item => parseInt(item.quantity) > 0
        );
        if(!atleastOneSelection){
            alert("Please select at least one item to order");
            return;
        }
        //DISABLE THE ORDER BUTTON TO PREVENT MULTIPE ERRONEOUS ORDERS
        setStopOrders(true)
        try{
            //insert the customer to DB
            const { data: customerData, error: customerError } = await supabase
            .from('customer')
            .insert([{rank, name}])
            .select('customer_id')

            if(customerError) throw customerError
            const customer_id = customerData[0].customer_id

            //insert order ONCE
            const { data: orderData, error: orderError } = await supabase
                .from('order')
                .insert([{customer_id}]) //adds the customer_id to the database
                .select('order_no')

                if(orderError) throw orderError;
                const order_no = orderData[0].order_no

                //insert the items with the same order_no
                const itemPayload = orders.map(order => ({
                    order_no,
                    order_name: order.order_name,
                    quantity: order.quantity,
                    price: order.price
                }));
            //insert the order to DB
           //new line for items
           const { error: itemError } = await supabase
                .from('items')
                .insert(itemPayload)
                console.log("item payload", itemPayload)
            
            if(orderError) throw itemError
            //if(orderError) throw orderError
            //grabs the first order_no
            //setSubmittedOrderNo(orderData[0].order_no)
            setSubmittedOrderNo(order_no);//this line is new for making items have the same order_no
            setShowPopup(true)
            console.log("Order placed successfully!")
        } catch(err){
            console.error('Database Error from Supabase: ', err)
        }
        
        //display the display order button
        const showOrderNoButton = document.querySelector('.showOrderNoButton')
        showOrderNoButton.style.position="absolute"
        showOrderNoButton.style.left='0'
        showOrderNoButton.style.right='0'
        showOrderNoButton.width="80%"
        showOrderNoButton.style.display="flex"
        showOrderNoButton.style.justifyContent="center"
    }
    //END OF: FORM SUBMISSION HANDLING
    function closeOrderPopUp(){
        const sideBar = document.querySelector('.sideBar');
        sideBar.style.display= 'none';
    }
   // const navigate = useNavigate();
    return(
        <div id="mainContent">
            {/*THE BOX THAT WILL ALERT THE USER TO SELECT AT LEAST ONE ITEM*/}
            <div className='selectAnItem'>
                <p>PLEASE SELECT AT LEAST ONE ITEM TO ORDER</p>
            </div>
            <img className='logo' src='/IMAGES/BattleAxeCafeLogo.png'></img>
            <br />
            <hr />
            <br />
            <div className='sideBar'>
                <input type='button' onClick={closeOrderPopUp} value="X" />
                <h3>poll closes: <i>Friday, 12pm CST</i></h3>
            </div>
            {/*START OF FORM*/}
            <form id='userForm' onSubmit={handleSubmit}>
                {/*<label htmlFor="genderRank"><strong>Rank (or select Sister):</strong></label><br />*/}
                <select required id="genderRank" name="genderRank" value={rank} onChange={(e) => setRank(e.target.value)}>
                    <option value="null">SELECT MEMBER STATUS</option>
                    <option value="Officer 80">Officer 80</option>
                    <option value="Officer 50">Officer 50</option>
                    <option value="Officer 20">Officer 20</option>
                    <option value="Officer 10">Officer 10</option>
                    <option value="Soldier">Soldier</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                </select>
                <br/>
                <br/>
                {/*evaluate the input tag 
                <label htmlFor="name"><strong>Enter your full name:</strong></label> 
                */}
                <input
                    required
                    type ="text" 
                    placeholder='Enter first and last name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <br/>
                {/*Meals*/}
                <h4>Select Your Meal&#40;s&#41;</h4>
                <span className='allergyWarning'>
                    <strong>ALLERGIES: Please let the kitchen team know of any allergies that you may have to prevent issues.</strong>
                    <br />
                    <strong>INQUIRE OF THE INGREDIENTS</strong>
                </span>
                <br />
                <br />
                <div className='meals'>
                    <Items 
                        image={"/IMAGES/salmon_cobb.jpg"}
                        imageAlt={''}
                        order_name={"GRILLED BLACKENED SALMON COBB SALAD: Includes Garlic Bread and a Drink"}
                        price={'$14'}
                        quantity={['0','1','2','3','4','5','6']}
                        onChange={handleOrderChange}
                    />
                </div>
                <input className='submitOrderButton' type="submit" value="Place Order" disabled={stopOrders}/>
            </form>
            <br />
            <br />
            <button className='showOrderNoButton' onClick={() =>setShowPopup(true)}>DISPLAY MY ORDER# </button>   

            {showPopup && (
                <OrderSubmitted 
                orderNo={submittedOrderNo} 
                onClose={() =>setShowPopup(false) } 
                />
            )}
            {/* END OF FORM*/}
            <br/>
            {/*SABBATH DIV*/}
            {isSabbath && (
                <div id='sabbath'>
                <h2>SHALOM, MHNCB AND </h2>
                    <h1><u>HAPPY SABBATH!</u></h1>
                    <p>
                        THE WEBSITE IS SHUTDOWN IN OBSERVATION OF THE LORD'S &nbsp;
                        <b>SABBATH DAY</b>
                    </p>
                    <p>
                        Please check back later Saturday after sundown!
                    </p>
                </div>
            )}

            {noMoreOrders && (
                <div id='noMoreOrders'>
                    <h1>THE KITCHEN IS NO LONGER ACCEPTING ORDERS!</h1>
                    <h3>Visit us again for next week's specials.</h3>
                </div>
            )}
        </div> 
    );
}
export default Main;