const express = require('express');
const bcrypt = require("bcrypt")
const connectDB = require('./config/database')
const User = require('./models/user');
const { userAuth } = require('./middlewares/auth');
const { validateSignUpData, validateEmailIdAndPassword } = require("./utils/validations")
const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken');


const app = express();

// we cannot read body of request directly, if we dont pass request from below middleware
// it converts the body to from json to js object
// as route is not first param, so it work for all routes
// if we give route as 1st param then it ll work only for that route.
app.use(express.json())
// using cookie-aprser middleware so that we can read cookie
app.use(cookieParser())


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
            // create json token, first param we are sending is id
            // so that token has id hidden inside it and later we can use it to find user.
            // second param is secret key that we are sending -> developer defined it is
            // third param is about token expira duration
            const token = await jwt.sign({ _id: userDetails._id }, "dev_Tinder@9864", { expiresIn: '1d' })
            // add token to cookie
            res.cookie("token", token, { expires: new Date(Date.now() + 900000), httpOnly: true, secure: true })
            res.send("User logged in successfully")
        } else {
            throw new Error("Invalid credentails")
        }
    } catch (err) {
        res.status(400).send("Unable to login: " + err.message)
    }
})

app.use(userAuth);

app.get("/profile", async (req, res) => {
    try {
        const userDetails = req.user;
        const { firstName, lastName, emailId, age, gender, skills, about, photoUrl } = userDetails;
        res.send({ firstName, lastName, emailId, age, gender, skills, about, photoUrl })
    } catch (err) {
        res.status(400).send("Error: " + err)
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

