const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra');
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejye6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service-icon'));
app.use(fileUpload());

const port = 3100;
app.get('/', (req, res) => {
    res.send("Thanks calleeeing me")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_SERVICES}`);
    app.post('/service', (req, res) => {
        const file = req.files.file;
        const title = req.body.serviceTitle;
        const description = req.body.serviceDescription;
        const filePath = `${__dirname}/service-icon/${file.name}`;


        file.mv(filePath, err => {
            if (err) {
                // console.log(err);
                // res.status(500).send({ msg: 'failed while uplaoding' });
            }
            const newImage = fs.readFileSync(filePath);
            const encodedimg = newImage.toString('base64');
            const image = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer.from(encodedimg, 'base64')
            };

            const service = { title, description, image }

            servicesCollection.insertOne(service)
                .then(result => {
                    fs.remove(filePath, anyerror => {
                        if (anyerror) {
                            // console.log(anyerror)
                            // res.status(500).send({ msg: 'failed while uplaoding' })
                        }
                    })
                })
        })
    })

    app.get('/service', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    const orderCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_ORDERS}`);
    app.post('/addorder', (req, res) => {
        const register = req.body;
        orderCollection.insertOne(register)
            .then(result => {
                // console.log(result.insertedCount)
                // res.sendStatus(result.insertedCount)
            })
    })



    app.get('/addorder', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/orderbyemail', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.patch('/update/:_id', (req, res) => {
        console.log(req.params._id)
        orderCollection.updateOne({ _id: ObjectId(req.params._id) },
            {
                $set: { status: req.body.getStatus }
            })
            .then(res => {
                console.log('update success')
            })
    })



    const adminCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_ADMINS}`);
    app.post('/addadmin', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
            .then(result => {

            })
    })
    app.get('/admins', (req, res) => {
        adminCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })



    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_REVIEWS}`);
    app.post('/addreview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => { })
    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


});



app.listen(process.env.PORT || port);