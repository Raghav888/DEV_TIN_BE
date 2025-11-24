const express = require('express');
const connectDB = require('./config/database')
const cookieParser = require("cookie-parser")
const http = require('http');

const app = express();
const cors = require('cors');
const env = require('dotenv');
env.config();

// read abouts cors in self docs of nodejs
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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
const initilizeSocket = require('./utils/socket');

// for socket io we need to create server like this
const server = http.createServer(app);
// initialize socket io
initilizeSocket(server);

app.use('/auth', authRouter);
app.use('/profile', profileRouter)
app.use('/requests', requestsRouter)
app.use('/user', userRouter);




// doing in this way so that first our db is connected then only server starts listening.
connectDB().then(() => {
    server.listen(process.env.PORT, () => {
        console.log('Server is running on port ' + process.env.PORT);
    });
    console.log("Connected to DB")
}).catch((err) => console.log("Failed to connect to DB" + err))

