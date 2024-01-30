const express = require('express')
require("express-async-errors");

const app = express()

require('dotenv').config();     // to load the .env file into the process.env object

//routes
app.get('/', (req, res) => {
    res.send('Hello, Book Explorer!');
});

//error handling middleware
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});


// Start the server
const port = process.env.PORT || 3000;

const start = async () => {
    try {
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();