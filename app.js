"use strict";

const { MongoClient, ObjectID } = require("mongodb");
const express = require("express");
const cors = require("cors");
const { request } = require("express");
const dotenv = require("dotenv");
dotenv.config();

const AWS = require("aws-sdk");
const config = require("./_config");
AWS.config.update(config);

const dbUrl =
  "mongodb+srv://admin:bjX2dGUEnrK4Zyd@cluster0.vl3pn.mongodb.net/food?retryWrites=true&w=majority";

const app = express();
const client = new MongoClient(dbUrl);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

var collection;

app.get("/search", async (req, res) => {
  try {
    let result = await collection
      .aggregate([
        {
          $search: {
            autocomplete: {
              query: `${req.query.term}`,
              path: "name",
              fuzzy: {
                maxEdits: 2,
              },
            },
          },
        },
      ])
      .toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ errorMessage: err.message });
  }
});

/* Endpoint for looking up a single item, copied from tutorial but needs
   to be reconfigured.
*/

// app.get("/get/:id", async (req, res) => {
//   try {
//     let result = await collection.findOne({ _id: ObjectID(request.params.id) });
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ errMessage: err.message });
//   }
// });

app.listen("3000", async () => {
  try {
    await client.connect();
    collection = client.db("food").collection("recipes");
  } catch (err) {
    console.log(err);
  }
});

module.exports = app;
