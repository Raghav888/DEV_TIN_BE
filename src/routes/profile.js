const express = require("express")
const User = require('../models/user');
const { validateEditProfileData } = require("../utils/validations")
const { userAuth } = require('../middlewares/auth');
const bcrypt = require("bcrypt")

const router = express.Router();

router.get("/view", userAuth, async (req, res) => {
    try {
        const userDetails = req.user;
        const { firstName, lastName, emailId, age, gender, skills, about, photoUrl, _id } = userDetails;
        res.json({ messgae: "user profile", data: { firstName, lastName, emailId, age, gender, skills, about, photoUrl, _id } })
    } catch (err) {
        res.status(400).send("Error: " + err)
    }
})

router.delete('/delete', userAuth, async (req, res) => {
    try {
        const id = req.user._id;
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

router.patch('/edit', userAuth, async (req, res) => {

    try {
        const isUpdateAllowed = validateEditProfileData(req)
        if (!isUpdateAllowed) {
            res.status(400).send("Fields update not allowed");
        }
        const id = req.user._id;
        const body = req.body;
        const user = await User.findByIdAndUpdate(id, body, { runValidators: true, new: true });
        // we can send json format of data also
        res.status(200).json({ message: "Updated successfully", data: { ...user._doc, password: "" } })

    } catch (err) {
        res.status(500).send("Error while updating " + err.message)
    }
})


router.patch('/password', userAuth, async (req, res) => {

    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }
        if (oldPassword === newPassword) {
            return res.status(400).json({ message: "Old and new passwords cannot be the same" });
        }
        const isOldPasswordCorrect = await req.user.checkPasswordIsCorrect(oldPassword)
        if (isOldPasswordCorrect) {
            const id = req.user._id;
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const user = await User.findByIdAndUpdate(id, { password: hashedPassword }, { runValidators: true, new: true });
            // we can send json format of data also
            res.status(200).json({ message: "Updated successfully", data: { ...user._doc, password: "" } })
        } else {
            return res.status(401).json({ message: "Old password is incorrect" });
        }
    } catch (err) {
        res.status(500).send("Error while updating " + err.message)
    }
})


module.exports = router;