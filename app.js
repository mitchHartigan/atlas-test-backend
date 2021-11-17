"use strict";

const { MongoClient, ObjectID } = require("mongodb");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const AWS = require("aws-sdk");
const config = require("./_config");
AWS.config.update(config);

const dbUrl = `mongodb+srv://admin:bjX2dGUEnrK4Zyd@cluster0.vl3pn.mongodb.net/food?retryWrites=true&w=majority`;

const app = express();
const client = new MongoClient(dbUrl);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const _loadCollection = async () => {
  try {
    await client.connect();
    let collection = client.db("mortgagebanking").collection("Acronyms");

    return collection;
  } catch (err) {
    console.log(err);
  }
};

app.get("/search", async (req, res) => {
  try {
    let collection = await _loadCollection();

    let result = await collection
      .aggregate([
        {
          $search: {
            compound: {
              should: [
                {
                  autocomplete: {
                    query: `${req.query.term}`,
                    path: "Acronym",
                    fuzzy: {
                      maxEdits: 1,
                    },
                    score: {
                      boost: {
                        value: 2,
                      },
                    },
                  },
                },
                {
                  autocomplete: {
                    query: `${req.query.term}`,
                    path: "Text",
                    fuzzy: {
                      maxEdits: 1,
                    },
                    score: {
                      boost: {
                        value: 2,
                      },
                    },
                  },
                },
              ],
            },
          },
          $project: {
            _id: 0,
            Text: 1,
            score: { $meta: "searchScore" },
          },
          $project: {
            _id: 0,
            Acronym: 1,
            score: { $meta: "searchScore" },
          },
        },
      ])
      .toArray();
    res.send(result);
  } catch (err) {
    res.status(502).send({ errorMessage: err.message });
  }
});

app.get("/", (req, res) => {
  res.status(200).send({ serverMessage: "app running!" });
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

app.listen("4000", async () => {
  console.log("Server running.");
});

module.exports = app;
