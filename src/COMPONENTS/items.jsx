import '../CSS/items.css'
        /*the container should have
        1. Image
        2. Description
        3. Quantity 
        */
function Items({image, imageAlt, order_name, price, quantity=[], onChange}){
    return(
        <div id="itemContainer">
            <div className='imageContainer'>
                <img id="itemImage" src={image} alt={imageAlt}></img>
            </div>
            <div className='detailOption'>
                <p>{order_name}</p>
                <p>{price}</p>
                <select onChange={(e) => onChange(order_name, e.target.value, price)}>
                    {quantity.map((opt, i) =>(
                        <option key={i} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Items;