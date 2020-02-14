const express = require('express')
const router = express.Router()
require('dotenv').config()

const sanitize = require('mongo-sanitize')
const ObjectId = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient
const DB_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB}`
const client = new MongoClient(DB_URL)

client.connect(err => {
  console.log(err)
})

/* GET nothing */
router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

/* GET stores list */
router.get('/stores', (req, res, next) => {
  const stores = client.db(process.env.DB).collection("stores").find({})
  stores.toArray((err, docs) => {
    res.send(JSON.stringify(docs))
  })
})

/* GET food types */
router.get('/types', (req, res, next) => {
  const stores = client.db(process.env.DB).collection("stores").find({})
  stores.toArray((err, docs) => {
    let types = []
    for (var index in docs) {
      types.push(docs[index].type)
    }
    types = [... new Set(types.flat())]
    res.send(JSON.stringify(types))
  })
})

/* POST uploads socre */
router.post('/score', (req, res, next) => {
  const data = req.body
  const now = new Date().getTime()
  const store_id = sanitize(data.store)
  const user = sanitize(data.user)
  const score = sanitize(data.score)  
  let stores = client.db(process.env.DB).collection("stores")
  
  stores.updateOne(
    {_id: new ObjectId(store_id)},
    {
      $pull: {
        scores: {
          user : user
        }
      }
    }
  )
  stores.updateOne(
    {_id: new ObjectId(store_id)},
    {
      $addToSet: {
        scores: {
          user : user,
          score : score,
          timestamp : now
        }
      }
    }
  )
  res.send("200")
})

module.exports = router
