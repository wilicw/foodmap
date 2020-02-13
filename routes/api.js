const express = require('express');
const router = express.Router();
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const DB_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB}`;
const client = new MongoClient(DB_URL);

client.connect(err => {
  console.log(err);
});

/* GET nothing */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

/* GET stores list */
router.get('/stores', (req, res, next) => {
  const stores = client.db(process.env.DB).collection("stores").find({});
  stores.toArray((err, docs) => {
    res.send(JSON.stringify(docs));
  })
});

/* GET food types */
router.get('/types', (req, res, next) => {
  const stores = client.db(process.env.DB).collection("stores").find({});
  stores.toArray((err, docs) => {
    let types = []
    for (var index in docs) {
      types.push(docs[index].type)
    }
    types = [... new Set(types.flat())]
    res.send(JSON.stringify(types));
  })
});

module.exports = router;
