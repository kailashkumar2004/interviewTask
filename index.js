const mongoose = require("mongoose");
const express = require("express");
const db = require("./src/db/db");
const router = require("./src/router");
const PORT = 9000;
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");


app.get("/", (req, res) => {
    res.send("wellcome to my page")
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", router);
app.listen(PORT, () => {
    console.log(`server is runing port number ${PORT}`)
});