// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Razorpay config
const razorpay = require("./razorpay");

// ---------- WHATSAPP WEBHOOK VERIFY ROUTE ----------

// GET /webhook  -> Meta isko call karega verify ke time
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    return res.status(200).send(challenge); // IMPORTANT
  } else {
    console.log("❌ Webhook verification failed");
    return res.sendStatus(403);
  }
});

// POST /webhook  -> Jab bhi message aayega, yahan payload aayega
app.post("/webhook", (req, res) => {
  console.log("📩 Incoming webhook:", JSON.stringify(req.body, null, 2));
  // Abhi ke liye sirf 200 OK
  res.sendStatus(200);
});

// ---------- RAZORPAY ORDER BANANE WALA ROUTE ----------

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // rupees me

    const options = {
      amount: amount * 100, // paise me
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    const order = await razorpay.orders.create(options);
    return res.json({ orderId: order.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Order create nahi ho paya" });
  }
});

// ---------- SERVER START ----------

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(" Server running on port ${PORT}");
});

