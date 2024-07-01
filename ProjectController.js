const { MongoClient } = require('mongodb')
const reader = require("xlsx")
const http = require('http');
const schedule = require('node-schedule')
const moment = require('moment-timezone');
const os = require('os-utils');
const { spawn } = require('child_process');
const path = require('path');
const url = "mongodb+srv://shivad2727:8074938497$@cluster.brqvhkz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose')
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

//API to upload the attached XLSX/CSV into MongoDB
exports.uploadData = async (req, res) => {
    try {
        const file_path = "C:/Users/ashok/Downloads/data-sheet-Node-js-Assesment-_1_.xlsx";
        const file = reader.readFile(file_path);
        let file_data = [];
        const sheets = file.Sheets[file.SheetNames];
        const temp = reader.utils.sheet_to_json(sheets);
        temp.forEach(res => {
            file_data.push(res);
        })
        const connection = client.db('sample_mflix').collection('agent');
        if (file_data.length > 0) {
            await connection.insertMany(file_data);
            res.send("Insertion Successfull")
        }
        else {
            res.send("No data is inserted")
        }
    }

    catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
    finally {
        await client.close();
    }
}

//Search API to find policy info with the help of username
exports.getPolicyInfo = async (req, res) => {
    try {
        let username = req.query.firstname;
        const connection = client.db('sample_mflix').collection('agent');
        let policy_info = { policy_number: 1, policy_start_date: 1, policy_start_date: 1, category_name: 1 }
        let result = await connection.aggregate([{ $match: { firstname: username } }, { $project: policy_info }]).toArray();
        res.send(result)
    }
    catch (error) {
        console.error('Error retrieving data', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
}
const ScheduledPostSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    given_date: {
        type: Date,
        required: true
    }
})
const ScheduledPost = mongoose.model('ScheduledPost', ScheduledPostSchema);

//Post-Service that takes the message,date-time and inserts that particular message into MongoDB
exports.postMessage = async (req, res) => {
    let given_date = req.body.date;
    schedule.scheduleJob(given_date, async() => {
        try {
            let message = req.body.message;
            const newScheduledPost = new ScheduledPost({ message, given_date });
            await newScheduledPost.save();
            const connection = client.db('sample_mflix').collection('agent');
            await connection.insertOne({ "message": message, "date": given_date });
            await client.close();
        }
        catch (error) {
            console.error('Message insertion failed', error);
            res.status(500).json({ error: 'Message insertion failed' });
        }
    })
}

function getRandomPort() {
    const min = 3000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let serverProcess;

// Function to start the server
function startServer() {
    const port = getRandomPort();
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World\n');
    });

    server.listen(port, () => {
        console.log('Server running');
    });
}


// Function to restart the server
function restartServer() {
    if (serverProcess) {
        console.log('Restarting server...');
        serverProcess.kill();
    } else {
        console.log('Starting server...');
        startServer();
    }
};

// Define the threshold (70% in this case)
const CPU_THRESHOLD = 0.7;

// Function to check CPU usage 
function checkCPUUsage() {
    os.cpuUsage(function (v) {
        console.log('CPU Usage (%): ' + v);//v is cpu usage

        // Check if usage exceeds threshold
        if (v > CPU_THRESHOLD) {
            console.log(`CPU usage is above ${CPU_THRESHOLD * 100}%. Restarting server...`);

            // Perform server restart logic here
            restartServer(3000);
        }
    });
}

//Function calling
checkCPUUsage();

//API to provide aggregated policy by each user
exports.getAggPolicyInfo = async (req, res) => {
    try {
        const connection = client.db('sample_mflix').collection('agent');
        let policy_info = { policy_number: 1, policy_start_date: 1, policy_start_date: 1, category_name: 1 }
        let result = await connection.aggregate([{
            $project: policy_info
        }]).toArray();
        res.send(result)
    }
    catch (error) {
        console.error('Error retrieving data', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
}