const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// Jwt
const jwt = require('jsonwebtoken')


// Middleware
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fnxcgsn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unAuthrizes access' });
  }
  const token = authorization.split(' ')[1]
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).send({ error: true, message: 'unAuthrizad access' })
    }
    req.decoded = decoded;
    next()
  })

}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carDoctor').collection('services');
    const checkOutCollection = client.db('carDoctor').collection('checkOut')

    // Jwt
    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 20 });
      res.send({ token });
    })


    // Servises
    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })


    // Check out
    app.get('/checkOut', verifyJwt, async (req, res) => {
      
      const decoded = req.decoded;
      console.log(decoded.email)

      if(decoded.email !== req.query.email){
        return res.status(401).send({error:1, message:'unAuthrized access'})
      }

      // console.log(req.headers.authorization);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await checkOutCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/checkOut', async (req, res) => {
      const checkOut = req.body;
      // console.log(checkOut);
      const result = await checkOutCollection.insertOne(checkOut);
      res.send(result);
    })

    app.delete('/checkOut/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await checkOutCollection.deleteOne(query);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('Server is running ', port);
})