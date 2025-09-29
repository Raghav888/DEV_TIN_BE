const express = require('express');
const connectDB = require('./config/database')
const User = require('./models/user');
const { adminAuth } = require('./middlewares/auth');

const app = express();

// we cannot read body of request directly, if we dont pass request from below middleware
// it converts the body to from json to js object
// as route is not first param, so it work for all routes
// if we give route as 1st param then it ll work only for that route.
app.use(express.json())

app.use(adminAuth);

app.post('/signup', async (req, res) => {
    try {
        // create a new instance of User model
        const user = new User(req.body)
        await user.save();
        res.status(200).send("User added successfully")
    }
    catch (err) {
        res.status(500).send("Error while saving" + err.message)
    }
})

// get all users from db
app.get('/feed', async (req, res) => {
    try {
        const feeds = await User.find({});
        res.status(200).send(feeds)
    } catch (err) {
        res.status(500).send("Error while retriving all data" + err.message)
    }
})

// doing in this way so that first our db is connected then only server starts listening.
connectDB().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
    console.log("Connected to DB")
}).catch(() => console.log("Failed to connect to DB"))

