const express = require('express')
const router = express.Router()

const redis = require('redis')
const redisExpireTime = 86400

const request = require('request')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const sanitize = require('mongo-sanitize')
const ObjectId = require('mongodb').ObjectID
const MongoClient = require('mongodb').MongoClient
const DB_URL = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB}`
const DBclient = new MongoClient(DB_URL)

DBclient.connect(err => {
  console.log(err)
})

let redisClient = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
})

/* GET nothing */
router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

/* GET stores list */
router.get('/stores', (req, res, next) => {
  redisClient.get("stores", (err, reply) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({"status": 500, "msg": "Server error."}))
      return
    }
    console.log(reply)
    if (reply) {
      res.send(reply)
    } else {
      const stores = DBclient.db(process.env.DB).collection("stores").find({})
      stores.toArray((err, docs) => {
        let result = []
        docs.map(store => {
          delete store.menu
          delete store.seats
          result.push(store)
        })
        res.send(JSON.stringify(result))
        redisClient.set("stores", JSON.stringify(result), 'EX', redisExpireTime)
      })
    }
  })
})

/* GET detial by store id */
router.get('/store/:store', (req, res, next) => {
  const store_id = sanitize(req.params.store)
  redisClient.get(store_id, (err, reply) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({"status": 500, "msg": "Server error."}))
      return
    }
    console.log(reply)
    if (reply) {
      res.send(reply)
    } else {
      DBclient.db(process.env.DB).collection("stores").findOne({
        _id: new ObjectId(store_id)
      }, (err, doc) => {
        let result
        if (doc) {
          /* Process seats data */
          let recentSeatsData = -1
          if (doc.seats) {
            recentSeatsData = doc.seats.sort((a, b) => b.timestamp - a.timestamp)
            if (recentSeatsData.length) {
              recentSeatsData = recentSeatsData[0]
            }
          }
          doc.seats = recentSeatsData
          result = doc
        } else {
          resilt = doc ? doc : {"status": 404, "msg": "No found."}
        }
        res.send(JSON.stringify(result))
        redisClient.set(store_id, JSON.stringify(doc), 'EX', redisExpireTime)
      })
    }
  })
})

/* GET food types */
router.get('/types', (req, res, next) => {
  redisClient.get("types", (err, reply) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({"status": 500, "msg": "Server error."}))
      return
    }
    console.log(reply)
    if (reply) {
      res.send(reply)
    } else {
      const stores = DBclient.db(process.env.DB).collection("stores").find({})
      stores.toArray((err, docs) => {
        let types = []
        for (var index in docs) {
          types.push(docs[index].type)
        }
        types = [... new Set(types.flat())]
        res.send(JSON.stringify(types))
        redisClient.set("types", JSON.stringify(types), 'EX', redisExpireTime)
      })
    }
  })
})

/* GET stores categories */
router.get('/categories', (req, res, next) => {
  redisClient.get("categories", (err, reply) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({"status": 500, "msg": "Server error."}))
      return
    }
    if (reply) {
      res.send(reply)
    } else {
      const stores = DBclient.db(process.env.DB).collection("stores").find({})
      stores.toArray((err, docs) => {
        let categories = []
        for (var index in docs) {
          categories.push(docs[index].categories)
        }
        categories = [... new Set(categories.flat())]
        res.send(JSON.stringify(categories))
        redisClient.set("categories", JSON.stringify(categories), 'EX', redisExpireTime)
      })
    }
  })
})

/* POST uploads socre */
router.post('/score/:store', (req, res, next) => {
  const data = req.body
  const now = new Date().getTime()
  const store_id = sanitize(req.params.store)
  const user = sanitize(data.user)
  const score = sanitize(data.score)
  redisClient.get(store_id, (err, reply) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({"status": 500, "msg": "Server error."}))
      return
    }
    console.log(reply)
    if (reply) {
      /* write into redis */
      let tmpObjectFormRedisReply = JSON.parse(reply)
      let filtered = tmpObjectFormRedisReply.score.filter(function(value, index, arr){
        return value.user != user
      })
      filtered.push({
        user: user,
        score: score,
        timestamp: now
      })
      tmpObjectFormRedisReply.score = filtered
      redisClient.set(store_id, JSON.stringify(tmpObjectFormRedisReply), 'EX', redisExpireTime)
    }
  })
  let stores = DBclient.db(process.env.DB).collection("stores")
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
  res.send(JSON.stringify({"status": 200, "msg": "Success"}))
})

/* POST uploads recent seats information */
router.post('/seats/:store', (req, res, next) => {
  const data = req.body
  const now = new Date().getTime()
  const store_id = sanitize(req.params.store)
  const seats = sanitize(data.seats)
  redisClient.get(store_id, (err, reply) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({"status": 500, "msg": "Server error."}))
      return
    }
    console.log(reply)
    if (reply) {
      /* write into redis */
      let tmpObjectFormRedisReply = JSON.parse(reply)
      tmpObjectFormRedisReply.seats = {}
      tmpObjectFormRedisReply.seats["seats"] = seats
      tmpObjectFormRedisReply.seats["timestamp"] = now
      redisClient.set(store_id, JSON.stringify(tmpObjectFormRedisReply), 'EX', redisExpireTime)
    }
  })
  /* update mongodb */
  let stores = DBclient.db(process.env.DB).collection("stores")
  stores.updateOne(
    {_id: new ObjectId(store_id)},
    {
      $push: {
        seats: {
          seats : seats,
          timestamp : now
        }
      }
    }
  )
  res.send(JSON.stringify({"status": 200, "msg": "Success"}))
})

/* POST edit stroe information */
router.post('/store/:store', (req, res, next) => {
  const data = req.body
  const now = new Date().getTime()
  const store_id = sanitize(req.params.store)
  redisClient.get(store_id, (err, reply) => {
    if (err) {
      console.log(err)
      res.send(JSON.stringify({"status": 500, "msg": "Server error."}))
      return
    }
    console.log(reply)
    if (reply) {
      /* write into redis */
      let tmpObjectFormRedisReply = JSON.parse(reply)
      tmpObjectFormRedisReply.name = sanitize(data.name)
      tmpObjectFormRedisReply.price_level = sanitize(data.price_level)
      tmpObjectFormRedisReply.type = sanitize(data.type)
      tmpObjectFormRedisReply.menu = sanitize(data.menu)
      tmpObjectFormRedisReply.categories = sanitize(data.categories)
      tmpObjectFormRedisReply.lastUpdate = now
      redisClient.set(store_id, JSON.stringify(tmpObjectFormRedisReply), 'EX', redisExpireTime)
    }
  })
  let stores = DBclient.db(process.env.DB).collection("stores")
  stores.updateOne(
    {_id: new ObjectId(store_id)},
    {
      $set: {
        name: sanitize(data.name),
        price_level: sanitize(data.price_level),
        type: sanitize(data.type),
        menu: sanitize(data.menu),
        categories: sanitize(data.categories),
        lastUpdate: now
      }
    }
  )
  res.send(JSON.stringify({"status": 200, "msg": "Success"}))
})

/* POST create a new user or login via google login */
router.post('/user/:token', (req, res, next) => {
  const accessToken = req.params.token
  request(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`, (error, response, body) => {
    if (response.statusCode != 200) {
      res.send(JSON.stringify({"status": 400, "msg": "access token error."}))
      return
    }
    body = JSON.parse(body)
    let users = DBclient.db(process.env.DB).collection("users")
    users.find({email: body.email}).toArray((err, arr) => {
      if (!arr.length) {
        users.insertOne({
          displayname: "",
          realname: "",
          email: body.email,
          isGoogle: true,
          stuID: null,
          school: null,
          personalID: null,
          verify: false
        })
      }
      let token = jwt.sign({
        email: body.email,
        googleAccessToken: accessToken
      }, process.env.JWT_SECRET)
      res.send(JSON.stringify({"status": 200, "msg": "Success", "token": token})) 
    })
  })
})

/* PUT update user information */
router.put('/user/:jwt', (req, res, next) => {
  const data = req.body
  const jwtToekn = req.params.jwt
  jwt.verify(jwtToekn, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.send(JSON.stringify({"status": 400, "msg": "access token error."}))
      return
    } else {
      let users = DBclient.db(process.env.DB).collection("users")
      console.log(decoded.email)
      users.count({email: {$ne: decoded.email}, displayname: data.displayName}, (err, count) => {
        if (count) {
          res.send(JSON.stringify({"status": 500, "msg": "暱稱已被使用"}))
          err++
        } else {
          users.update({email: decoded.email}, {
            $set: {          
              displayname: sanitize(data.displayName),
              realname: sanitize(data.realName),
              stuID: sanitize(data.stuID),
              personalID: sanitize(data.personalID),
              school: sanitize(data.school)
            }
          })
          res.send(JSON.stringify({"status": 200, "msg": "Success"}))
        }
      })
    }
  })
})

/* GET get user information via jwt token */
router.get('/user/:jwt', (req, res, next) => {
  const jwtToekn = req.params.jwt
  jwt.verify(jwtToekn, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.send(JSON.stringify({"status": 400, "msg": "access token error."}))
      return
    }
    request(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${decoded.googleAccessToken}`, (error, response, body) => {
      if (response.statusCode != 200) {
        res.send(JSON.stringify({"status": 400, "msg": "access token error."}))
        res.end()
        return
      }
      let users = DBclient.db(process.env.DB).collection("users")
      users.findOne({email: decoded.email}, (err, doc) => {
        res.send(JSON.stringify({"status": 200, "msg": "Success", "data": doc}))
      })
    })
  })
})

module.exports = router
