// below schema will be used for adding new user on signup.

const mongoose = require('mongoose');
const validator = require('validator')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value) {
            return validator.isEmail(value)
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            return validator.isStrongPassword(value)
        }
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    gender: {
        type: String,
        required: true,
        validate(value) {
            if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
                throw new Error("Gender is not valid")
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://avatar.iran.liara.run/public",
    },
    skills: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 5;
            },
            message: props => `You can specify up to 5 skills only. (${props.value.length} provided)`
        }
    },
    about: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true
});

// never use arrow function as this works differently in arrow function
userSchema.methods.getJWT = async function () {
    // here this refers to document that is founded
    userDetails = this;
    // create json token, first param we are sending is id
    // so that token has id hidden inside it and later we can use it to find user.
    // second param is secret key that we are sending -> developer defined it is
    // third param is about token expira duration
    const token = await jwt.sign({ _id: userDetails._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
    return token;
}

userSchema.methods.checkPasswordIsCorrect = async function (passwordInputByUser) {
    const userDetails = this;
    const isCorrect = await bcrypt.compare(passwordInputByUser, userDetails.password);
    return isCorrect
}

// should start with capital letter only
const User = mongoose.model('User', userSchema);

module.exports = User;