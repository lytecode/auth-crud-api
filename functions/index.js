const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const userRoutes = require("./api/users/router");

const app = express();

//middleware
app.use(cors());
app.use(express.json());

app.use("/api/v1", userRoutes);

exports.app = functions.https.onRequest(app);
