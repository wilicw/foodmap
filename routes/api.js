const express = require('express');
const router = express.Router();
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const DB_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB}`;
const client = new MongoClient(DB_URL);

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/stores', (req, res, next) => {
  client.connect(err => {
    const stores = client.db(process.env.DB).collection("stores").find({});
    stores.toArray((err, docs) => {
      console.log(docs)
      res.send(JSON.stringify(docs));
    })
  });
});

router.get('/types', (req, res, next) => {
  client.connect(err => {
    const stores = client.db(process.env.DB).collection("stores").find({});
    stores.toArray((err, docs) => {
      let types = []
      for (var index in docs) {
        console.log(docs[index])
        types.push(docs[index].type)
      }
      types = [... new Set(types.flat())]
      res.send(JSON.stringify(types));
    })
  });
});


module.exports = router;
