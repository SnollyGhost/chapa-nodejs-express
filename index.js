

const express = require("express");
const app = express();
const axios = require("axios").default;
require("dotenv").config();

const PORT = process.env.PORT || 4400;
const CHAPA_URL =
  process.env.CHAPA_URL || "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_AUTH = process.env.CHAPA_AUTH // || register to chapa and get the key

app.set("view engine", "ejs");

const config = {
  headers: {
    Authorization: `Bearer ${CHAPA_AUTH}`,
  },
};

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/api/pay", async (req, res) => {
  const CALLBACK_URL = `http://localhost:${PORT}/api/verify-payment/`;
  const RETURN_URL = `http://localhost:${PORT}/api/payment-success/`;
  const TEXT_REF = "tx-myecommerce12345-" + Date.now();
  const data = {
    amount: "100",
    currency: "ETB",
    email: "ato@ekele.com",
    first_name: "Ato",
    last_name: "Ekele",
    tx_ref: TEXT_REF,
    callback_url: CALLBACK_URL + TEXT_REF,
    return_url: RETURN_URL,
  };

  try {
    const response = await axios.post(CHAPA_URL, data, config);


    res.redirect(response.data.data.checkout_url);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/verify-payment/:id", async (req, res) => {
  try {
    await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${req.params.id}`,
      config
    );
    console.log("Payment was successfully verified");
    res.sendStatus(200);
  } catch (error) {
    console.error("Payment can't be verified", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/payment-success", (req, res) => {
  // allow the user to take a screenshot or download the RECIEPT
  setTimeout(() => {
    res.render("success");
  }, 30000); // 30 seconds
});
app.listen(PORT, () => console.log("Server listening on port:", PORT));
