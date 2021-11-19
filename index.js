const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;


const port = process.env.PORT || 7000

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended : true
}))
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lfgr1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();

      const database = client.db('niche-product-website-server-side');
      const productsCollection = database.collection('products');
      const showRoomsCollection = database.collection('showRooms');
      const allProductCollection = database.collection('allProduct');
      const usersCollection = database.collection('users');
      const confirmPurchaseCollection = database.collection('confirmPurchase');
      const reviewCollection = database.collection('review');

        // get products

        app.get("/products", async (req, res) => {
        const result = await productsCollection.find({}).toArray();
        res.send(result);
        });

        // get showrooms

        app.get("/showRooms", async (req, res) => {
        const result = await showRoomsCollection.find({}).toArray();
        res.send(result);
        });

         //  explore all products

        app.get("/allProduct", async (req, res) => {
          const result = await allProductCollection.find({}).toArray();
          res.send(result);
        });

        // users

        app.post("/users", async (req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          // console.log(result);
          res.send(result);
      });

      //get single product detail

      app.get("/productDetail/:id", async (req, res) => {
        const result = await productsCollection
        .find({ _id: ObjectId(req.params.id) })
        .toArray();
        // console.log(result);
        res.send(result[0]);
      });

       // cofirm purchase

      app.post("/confirmPurchase", async (req, res) => {
        const result = await confirmPurchaseCollection.insertOne(req.body);
        // console.log(result);
        res.send(result);
      });

      //get product detail from explore

      app.get("/allProductDetail/:id", async (req, res) => {
        const result = await allProductCollection
        .find({ _id: ObjectId(req.params.id) })
        .toArray();
        // console.log(result);
        res.send(result[0]);
      });

       // cofirm purchase from explore

      app.post("/confirmAllProductPurchase", async (req, res) => {
        const result = await confirmPurchaseCollection.insertOne(req.body);
        // console.log(result);
        res.send(result);
      });

      // add new product

      app.post("/addNewProduct", async(req, res) => {
        const result = await allProductCollection.insertOne(req.body);
        // console.log(result);
        res.send(result);
     });

      // my Orders

      app.get("/myOrders/:email", async (req, res) => {
        const result = await confirmPurchaseCollection
          .find({ email: req.params.email })
          .toArray();
          res.send(result);
      });

      // delete myOrder

      app.delete("/deleteOrder/:id", async (req, res) => {
        const result = await confirmPurchaseCollection.deleteOne({
          _id: ObjectId(req.params.id),
        });
        res.send(result);
      });

      // make admin

      app.put('/users/admin', async (req, res) => {
        const user = req.body;
        // console.log('put', user);
        const filter = {email: user.email};
        const updateDoc = {$set : {role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.json(result);
    })

    // admin control

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  })

    //  manage all Orders

    app.get("/manageAllOrders", async (req, res) => {
      const result = await confirmPurchaseCollection.find({}).toArray();
      res.send(result);
    });
  
      //delete manage all Order
  
      app.delete("/deleteManageOrder/:id", async (req, res) => {
        const result = await confirmPurchaseCollection.deleteOne({
          _id: ObjectId(req.params.id),
        });
        res.send(result);
      });
  
       // update status

        app.put('/updateStatus/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {$set : {status: 'shipped'}};
        const result = await confirmPurchaseCollection.updateOne(filter, updateDoc)
        res.json(result);
    })

    //  manage all product

    app.get("/manageProducts", async (req, res) => {
      const result = await allProductCollection.find({}).toArray();
      res.send(result);
    });
  
      //delete from all product
  
      app.delete("/deleteManageProducts/:id", async (req, res) => {
        const result = await allProductCollection.deleteOne({
        _id: ObjectId(req.params.id),
        });
        res.send(result);
      });

      // cofirm purchase

      app.post("/review", async (req, res) => {
        const result = await reviewCollection.insertOne(req.body);
        // console.log(result);
        res.send(result);
      });

      //  review

      app.get("/reviewDisplay", async (req, res) => {
        const result = await reviewCollection.find({}).toArray();
        res.send(result);
    });


}   
    finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})