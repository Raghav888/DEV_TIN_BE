const express = require("express")
const bcrypt = require("bcrypt")
const User = require('../models/user');
const { validateSignUpData, validateEmailIdAndPassword } = require("../utils/validations");

const router = express.Router();

router.post('/signup', async (req, res) => {
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

router.post('/login', async (req, res) => {

    try {
        validateEmailIdAndPassword(req)
        const { password, emailId } = req.body;
        const userDetails = await User.findOne({ emailId })
        if (!userDetails) {
            // always send generic error, dont say exactly email is wrong or pass is wrong
            throw new Error("Invalid credentails")
        }
        // checkPasswordIsCorrect is schema method now in user schema
        const isPasswordCorrect = await userDetails.checkPasswordIsCorrect(password)
        if (isPasswordCorrect) {
            //getJWT method is offloaded method to schema USER
            const token = await userDetails.getJWT();
            // add token to cookie
            res.cookie("token", token, { expires: new Date(Date.now() + 900000), httpOnly: true, secure: true })
            res.json({ messgae: "User logged in successfully", data: userDetails })
        } else {
            throw new Error("Invalid credentails")
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.post('/logout', async (req, res) => {
    try {
        res.clearCookie("token").send("Logout successfully")
    } catch (err) {
        res.status(400).send("Failed to logout: " + err)
    }
})

module.exports = router;