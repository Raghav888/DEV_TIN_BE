const express = require('express');
const bcrypt = require("bcrypt")
const connectDB = require('./config/database')
const User = require('./models/user');
const { adminAuth } = require('./middlewares/auth');
const { validateSignUpData, validateEmailIdAndPassword } = require("./utils/validations")

const app = express();

// we cannot read body of request directly, if we dont pass request from below middleware
// it converts the body to from json to js object
// as route is not first param, so it work for all routes
// if we give route as 1st param then it ll work only for that route.
app.use(express.json())

app.use(adminAuth);

app.post('/signup', async (req, res) => {
    try {
        // validation of data - api level
        validateSignUpData(req);

        const { firstName, lastName, emailId, password, age, gender } = req.body;

        // hashing of password - takes password and salt. salt should be high so that encryption is also higher layer
        const hashedPassword = await bcrypt.hashSync(password, 10);
        // create a new instance of User model
        const user = new User({
            firstName, lastName, emailId, password: hashedPassword, age, gender
        })
        await user.save();
        res.status(200).send("User added successfully")
    }
    catch (err) {
        res.status(500).send("Error while saving " + err.message)
    }
})

app.post('/login', async (req, res) => {

    try {
        validateEmailIdAndPassword(req)
        const { password, emailId } = req.body;
        const userDetails = await User.findOne({ emailId })
        if (!userDetails) {
            // always send generic error, dont say exactly email is wrong or pass is wrong
            throw new Error("Invalid credentails")
        }
        const isPasswordCorrect = await bcrypt.compare(password, userDetails.password)
        if (isPasswordCorrect) {
            res.send("User logged in successfully")
        } else {
            throw new Error("Invalid credentails")
        }
    } catch (err) {
        res.status(400).send("Unable to login: " + err.message)
    }
})

// get all users from db
app.get('/feed', async (req, res) => {
    try {
        // get all data from User collection
        const feeds = await User.find({});
        res.status(200).send(feeds)
    } catch (err) {
        res.status(500).send("Error while retriving all data" + err.message)
    }
})

app.delete('/user', async (req, res) => {
    try {
        const id = req.body.id;
        const userDeleted = await User.findByIdAndDelete(id)
        if (!userDeleted) {
            res.status(404).send("User not found")
        } else {
            res.status(200).send("User deleted")
        }
    } catch (err) {
        res.status(500).send("Error while deleting " + err.message)
    }
})

app.patch('/user/:userId', async (req, res) => {
    // if the field doesnt exist in model then it will not add that in db
    // api level validation
    const ALLOWED_FIELD_TO_UPDATE = ['firstName', "lastName", "password", "age", "photoUrl", "skills", "about"]
    const isUpdateAllowed = Object.keys(req.body).every(key => ALLOWED_FIELD_TO_UPDATE.includes(key));

    try {
        if (!isUpdateAllowed) {
            res.status(400).send("Fields update not allowed");
        }
        const id = req.params.userId;
        const body = req.body;
        await User.findByIdAndUpdate(id, body, { runValidators: true });
        res.status(200).send("Updated successfully")

    } catch (err) {
        res.status(500).send("Error while updating " + err.message)
    }
})

// doing in this way so that first our db is connected then only server starts listening.
connectDB().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
    console.log("Connected to DB")
}).catch(() => console.log("Failed to connect to DB"))

