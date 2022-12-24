const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
require('dotenv').config();
const stripe = require('stripe')(
  'sk_test_51JwKPsJquxAPgLX0snZNEvscIs2orLssRNgX6QuLV0oEXS3GUa4iLM5C1S9Z4ZxoJt1QYW4CvelbYcjYlAxN7i7T00zRkZtqgr'
);
// const SSLCommerzPayment = require('sslcommerz');
const { v4: uuidv4 } = require('uuid');

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ckcl0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// routes
async function run() {
  try {
    await client.connect();

    const db = client.db('newView');
    const roomsCollection = db.collection('rooms');
    const bookingsCollection = db.collection('bookings');
    const usersCollection = db.collection('users');

    // Get rooms
    app.get('/rooms', async (req, res) => {
      const rooms = roomsCollection.find({});
      const result = await rooms.toArray();
      res.send(result);
    });

    // Search product by name

    app.get('/search/:name', async (req, res) => {
      var regex = new RegExp(req.params.name, 'i');
      const result = roomsCollection.find({ name: regex });
      res.send(result);
    });

    // Get rooms by id
    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    // Post bookings
    app.post('/bookings', async (req, res) => {
      const bookings = req.body;
      const result = await bookingsCollection.insertOne(bookings);
      res.send(result);
    });

    // Get all bookings
    app.get('/bookings', async (req, res) => {
      const bookings = bookingsCollection.find({});
      const result = await bookings.toArray();
      res.send(result);
    });

    // post users
    app.post('/users', async (req, res) => {
      const doc = req.body;
      const result = await usersCollection.insertOne(doc);
      res.send(result);
    });

    // Put users email
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // post stripe payment
    app.post('/create-payment-intent', async (req, res) => {
      const paymentInfo = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentInfo.price * 100,
        currency: 'usd',
        payment_method_types: ['card'],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    //sslcommerz init
    // app.get('/init', async (req, res) => {
    //   const data = {
    //     total_amount: 100,
    //     currency: 'EUR',
    //     tran_id: 'REF123',
    //     success_url: 'http://localhost:5000/success',
    //     fail_url: 'http://localhost:5000/fail',
    //     cancel_url: 'http://localhost:5000/cancel',
    //     ipn_url: 'http://localhost:5000/ipn',
    //     shipping_method: 'Courier',
    //     product_name: 'Computer.',
    //     product_category: 'Electronic',
    //     product_profile: 'general',
    //     cus_name: 'Customer Name',
    //     cus_email: 'cust@yahoo.com',
    //     cus_add1: 'Dhaka',
    //     cus_add2: 'Dhaka',
    //     cus_city: 'Dhaka',
    //     cus_state: 'Dhaka',
    //     cus_postcode: '1000',
    //     cus_country: 'Bangladesh',
    //     cus_phone: '01711111111',
    //     cus_fax: '01711111111',
    //     ship_name: 'Customer Name',
    //     ship_add1: 'Dhaka',
    //     ship_add2: 'Dhaka',
    //     ship_city: 'Dhaka',
    //     ship_state: 'Dhaka',
    //     ship_postcode: 1000,
    //     ship_country: 'Bangladesh',
    //     multi_card_name: 'mastercard',
    //     value_a: 'ref001_A',
    //     value_b: 'ref002_B',
    //     value_c: 'ref003_C',
    //     value_d: 'ref004_D',
    //   };
    //   console.log(data);
    //   const sslcommer = new SSLCommerzPayment(
    //     process.env.STORE_ID,
    //     process.env.STORE_PASS,
    //     false
    //   ); //true for live default false for sandbox

    //   sslcommer.init(data).then((data) => {
    //     //process the response that got from sslcommerz
    //     //https://developer.sslcommerz.com/doc/v4/#returned-parameters

    //     if (data?.GatewayPageURL) {
    //       return res.status(200).redirect(data?.GatewayPageURL);
    //     } else {
    //       res.status(400).json({
    //         message: 'Ssl session was not successful',
    //       });
    //     }
    //   });
    // });

    // app.post('/success', async (req, res) => {
    //   return res.status(200).json({
    //     data: req.body,
    //   });
    // });
    // app.post('/cancel', async (req, res) => {
    //   return res.status(200).json({
    //     data: req.body,
    //   });
    // });
    // app.post('/fail', async (req, res) => {
    //   return res.status(400).json({
    //     data: req.body,
    //   });
    // });
    // app.post('/ipn', async (req, res) => {
    //   return res.status(200).json({
    //     data: req.body,
    //   });
    // });
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('The new view server is running successfully');
});

// listen
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
