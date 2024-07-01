const express = require('express')
const { MongoClient } = require('mongodb');
// const {PORT}  = require('dotenv')
const cors = require('cors')
const app = express();
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const bodyParser=require("body-parser");
app.use(cors())
app.use(express.json())
const url = "mongodb+srv://shivad2727:8074938497$@cluster.brqvhkz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

require("./ProjectRoute")(app);
app.use(helmet());
app.use(bodyParser.json({type: "*/json"}));
app.use(
    fileUpload({
        useTempFiles : true,
        tempFileDir: "/tmp",
    })
)

app.listen(4000, async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB successfully!');
        console.log("http://localhost:4000")
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})