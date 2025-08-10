import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { url } from '../../assets/assets';

const PlaceOrder = () => {

    const [payment, setPayment] = useState("cod")
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    })

    const { getTotalCartAmount, token, food_list, cartItems, currency, deliveryCharge } = useContext(StoreContext);
    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const placeOrder = async (e) => {
        e.preventDefault();

        let orderItems = [];
        food_list.map((item) => {
            if (cartItems[item._id] > 0) {
                let itemInfo = item;
                itemInfo["quantity"] = cartItems[item._id];
                orderItems.push(itemInfo);
            }
        })

        let orderData = {
            items: orderItems,
            amount: getTotalCartAmount(),
            address: data
        }

        try {
            if (payment === "cod") {
                const response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
                if (response.data.success) {
                    toast.success("Order placed (COD)");
                    navigate('/myorders');
                } else {
                    toast.error(response.data.message || "Error");
                }
            } else if (payment === "razorpay") {
                const response = await axios.post(`${url}/api/order/place`, orderData, { headers: { token } });
                if (!response.data.success) return toast.error(response.data.message || "Failed to create order");
                const { key, razorpayOrderId, amount, orderId } = response.data;

                // Load Razorpay SDK
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                  const rzp = new window.Razorpay({
                    key,
                    amount,
                    currency: 'INR',
                    name: 'Quick Bite',
                    description: 'Order payment',
                    order_id: razorpayOrderId,
                    prefill: { email: data.email, contact: data.phone, name: data.firstName + ' ' + data.lastName },
                    handler: async function (resp) {
                      const verify = await axios.post(`${url}/api/order/verify`, {
                        orderId,
                        razorpay_order_id: resp.razorpay_order_id,
                        razorpay_payment_id: resp.razorpay_payment_id,
                        razorpay_signature: resp.razorpay_signature,
                      });
                      if (verify.data.success) {
                        toast.success('Payment success');
                        navigate('/myorders');
                      } else {
                        toast.error('Payment verification failed');
                      }
                    },
                    theme: { color: '#ff4343' }
                  });
                  rzp.open();
                };
                document.body.appendChild(script);
            }
        } catch (err) {
            toast.error("Error placing order");
        }
    }

    useEffect(() => {
        if (!token) {
            toast.warning("Login to place order");
            navigate('/login');
        }
        else if (getTotalCartAmount() === 0) {
            navigate('/cart')
        }
    }, [token])

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Delivery Information</p>
                <div className="multi-fields">
                    <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
                    <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
                </div>
                <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
                <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
                <div className="multi-fields">
                    <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
                    <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
                </div>
                <div className="multi-fields">
                    <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
                    <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
                </div>
                <input required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
            </div>

            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>{currency}{getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>{currency}{getTotalCartAmount() === 0 ? 0 : deliveryCharge}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Total</b>
                            <b>{currency}{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge}</b>
                        </div>
                    </div>
                    <div className="payment-method">
                        <h3>Payment Method</h3>
                        <div>
                            <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                            <label>Cash on Delivery</label>
                        </div>
                        <div>
                            <input type="radio" checked={payment === "razorpay"} onChange={() => setPayment("razorpay")} />
                            <label>Razorpay</label>
                        </div>
                    </div>
                    <button type='submit'>Proceed to Payment</button>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder