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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const _loadCollection = async () => {
  try {
    const client = new MongoClient(dbUrl);
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
                  text: {
                    query: `${req.query.term}`,
                    path: "Acronym",
                    score: { boost: { value: 3 } },
                  },
                },
                {
                  text: {
                    query: `${req.query.term}`,
                    path: "Text",
                    score: { boost: { value: 2 } },
                  },
                },
                {
                  autocomplete: {
                    query: `${req.query.term}`,
                    path: "Acronym",
                    score: { boost: { value: 1 } },
                  },
                },
                {
                  autocomplete: {
                    query: `${req.query.term}`,
                    path: "Text",
                    score: { boost: { value: 1 } },
                  },
                },
              ],
            },
          },
        },
        { $limit: 50 },
        {
          $project: {
            _id: 1,
            Acronym: 1,
            Citation: 1,
            "Description of use": 1,
            "Date Entered": 1,
            Text: 1,
            Definition: 1,
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

app.listen("4000", async () => {
  console.log("Server running.");
});

module.exports = app;
