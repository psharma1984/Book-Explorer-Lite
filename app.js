const express = require('express')
require("express-async-errors");

const app = express()

require('dotenv').config();

//session configuration
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session); // to store session data in mongoDb
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
    uri: url,
    collection: 'sessions',
});
store.on('error', function (error) {
    console.log(error);
});

const sessionParams = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionParams.cookie.secure = true; // serve secure cookies
}
app.use(session(sessionParams));
//middlewares

app.use(require('connect-flash'));      //flash-messages configuration 

//routes
app.get('/', (req, res) => {
    // Access sessionId
    const sessionId = req.sessionID;
    console.log('Session ID:', sessionId);

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