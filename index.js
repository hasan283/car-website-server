const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleWare 
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1nfoa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const stockCollection = client.db('inventoryCar').collection('stock');
        app.get('/stock', async (req, res) => {
            const query = {};
            const cursor = stockCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });


        // GET 
        app.get('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await stockCollection.findOne(query);
            res.send(result);
        });

        // Inventory Count 
        app.get('/stockCount', async (req, res) => {
            const query = {};
            const cursor = stockCollection.find(query);
            const count = await cursor.count();
            res.send({ count });
        })

        // POST 
        app.post('/stock', async (req, res) => {
            const newStock = req.body;
            const result = await stockCollection.insertOne(newStock);
            res.send(result);
        });

        // Delete 
        app.delete('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await stockCollection.deleteOne(query);
            res.send(result);
        });




    }
    finally { }

}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('Running Inventory Car Management Website!!');
});

app.listen(port, () => {
    console.log('Inventory Car Management Website Server Add Success!!', port)
})