const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleWare 
// middleWare 
// middleWare 
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorize Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Token' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    });
}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1nfoa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const stockCollection = client.db('inventoryCar').collection('stock');
        const orderCollection = client.db('inventoryCar').collection('order');

        // Auth 
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        // Stock Api 
        app.get('/stock', async (req, res) => {
            console.log('query', req.query)
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = stockCollection.find(query);
            let stocks;
            if (page || size) {
                stocks = await cursor.skip(page * size).limit(size).toArray();
            } else {
                stocks = await cursor.toArray();
            }

            res.send(stocks);
        });


        // Inventory Count 
        app.get('/stockCount', async (req, res) => {
            const count = await stockCollection.estimatedDocumentCount();
            res.send({ count });
        })

        // GET 
        app.get('/stock/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await stockCollection.findOne(query);
            res.send(result);
        });



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

        // Order Collection Api 
        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } else {
                res.status(403).send({ message: 'forbidden access' });
            }
        })


        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })


    }
    finally { }

}
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('Running Inventory Car Management Website!!');
});

app.get('/heroku', (req, res) => {
    res.send('Heroku')
})

app.listen(port, () => {
    console.log('Inventory Car Management Website Server Add Success!!', port)
})