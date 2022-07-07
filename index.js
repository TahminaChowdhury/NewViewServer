const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ckcl0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);
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
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('The new view server is running successfully');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
