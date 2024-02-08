const express = require('express')
const path = require('path');
require('dotenv').config();
const { featuredBooks } = require('./controllers/Book')

require("express-async-errors");

const app = express()


//body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser(process.env.SESSION_SECRET));

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
require('./backgroundTasks/backgroundTask');

if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sessionParams.cookie.secure = true; // serve secure cookies
}
app.use(session(sessionParams));

//passport configuration
const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Configure CSRF middleware
const hostCsrf = require('host-csrf');
const csrf_development_mode = true;
if (app.get("env") === "production") {
    csrf_development_mode = false;
    app.set("trust proxy", 1);
}
const csrf_options = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
};
app.use(hostCsrf(csrf_options));

//middlewares

app.use(require('connect-flash')());      //flash-messages configuration 
app.use(require("./middlewares/storeLocals"));
app.use(express.static(path.join(__dirname, 'public')));
const auth = require("./middlewares/auth");

//routes
app.get("/", featuredBooks);
app.use("/sessions", require("./routes/sessionRoutes"));
app.set('view engine', 'ejs');
const bookRouter = require('./routes/Book');   //bookRouter
app.use("/books", auth, bookRouter);
//routes
// app.get('/', (req, res) => {
//     // Access sessionId
//     const sessionId = req.sessionID;
//     console.log('Session ID:', sessionId);

//     res.send('Hello, Book Explorer!');
// });


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
        await require("./db/connect")(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();