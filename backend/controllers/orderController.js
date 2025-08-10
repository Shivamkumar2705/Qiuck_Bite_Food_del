import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const deliveryCharge = 50;

// Razorpay init
const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create order and Razorpay order
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    // Save order in DB (pending payment)
    const newOrder = await orderModel.create({
      userId,
      items,
      amount: amount + deliveryCharge,
      address,
      status: "Food Processing",
      payment: false,
    });

    // Create Razorpay order
    const options = {
      amount: Math.round((amount + deliveryCharge) * 100),
      currency: "INR",
      receipt: newOrder._id.toString(),
    };
    const rzpOrder = await razor.orders.create(options);

    res.json({
      success: true,
      orderId: newOrder._id,
      razorpayOrderId: rzpOrder.id,
      key: process.env.RAZORPAY_KEY,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Order creation failed" });
  }
};

// Verify payment signature
const verifyOrder = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body).digest("hex");

    if (expected === razorpay_signature) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      // Clear user's cart
      const order = await orderModel.findById(orderId);
      if (order?.userId) {
        await userModel.findByIdAndUpdate(order.userId, { $set: { cartData: {} } });
      }
      return res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Signature mismatch" });
    }
  } catch (e) {
    console.error(e);
    res.json({ success: false, message: "Verification failed" });
  }
};

// List all orders (admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch {
    res.json({ success: false, message: "Error" });
  }
};

// User orders
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch {
    res.json({ success: false, message: "Error" });
  }
};

// Update status (admin)
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" });
  } catch {
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, listOrders, userOrders, updateStatus };