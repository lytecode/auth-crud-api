const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const express = require("express");
const Joi = require("joi");

admin.initializeApp();
const db = admin.firestore();
const users = db.collection("users");

const app = express();

//middleware
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const userRef = await users.get();
  const allUsers = [];
  userRef.forEach((doc) => allUsers.push({ ...doc.data(), id: doc.id }));
  res.status(200).json({
    success: true,
    data: allUsers,
  });
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;
  const doc = await users.doc(id).get();
  if (!doc.exists) {
    return res
      .status(404)
      .json({ success: false, error: `${id} does not exist` });
  }

  return res
    .status(200)
    .json({ success: true, data: [{ ...doc.data(), id: doc.id }] });
});

app.post("/", async (req, res) => {
  //Validate request
  const schema = Joi.object({
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
  });
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  const timeStamp = new Date().getTime();
  const userData = { ...req.body, created: timeStamp, modified: timeStamp };
  const userRef = await users.add(userData);
  const userCreated = { ...userData, id: userRef.id };

  res.status(201).json({ success: true, data: [userCreated] });
});

app.put("/:id", async (req, res) => {
  const id = req.params.id;
  const doc = await users.doc(id).get();

  if (!doc.exists) {
    return res
      .status(404)
      .json({ success: false, error: `${req.params.id} does not exist` });
  }

  //validate input
  const schema = Joi.object({
    firstName: Joi.string().min(2),
    lastName: Joi.string().min(2),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  const modified = new Date().getTime();
  await users.doc(id).update({ ...req.body, modified });

  return res
    .status(200)
    .json({ success: true, data: [{ ...req.body, modified, id }] });
});

app.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const doc = await users.doc(id).get();

  if (!doc.exists) {
    return res
      .status(404)
      .json({ success: false, error: `${id} does not exist` });
  }
  await users.doc(id).delete();
  return res.status(200).json({ success: true, data: [] });
});

exports.app = functions.https.onRequest(app);
