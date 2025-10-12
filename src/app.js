const express = require('express');
const connectDB = require('./config/database')
const cookieParser = require("cookie-parser")

const app = express();

// we cannot read body of request directly, if we dont pass request from below middleware
// it converts the body to from json to js object
// as route is not first param, so it work for all routes
// if we give route as 1st param then it ll work only for that route.
app.use(express.json())
// using cookie-aprser middleware so that we can read cookie
app.use(cookieParser())

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestsRouter = require('./routes/requests');
const userRouter = require('./routes/user');

app.use('/auth', authRouter);
app.use('/profile', profileRouter)
app.use('/requests', requestsRouter)
app.use('/user', userRouter);

// doing in this way so that first our db is connected then only server starts listening.
connectDB().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
    console.log("Connected to DB")
}).catch(() => console.log("Failed to connect to DB"))

