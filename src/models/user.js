// below schema will be used for adding new user on signup.

const mongoose = require('mongoose');
const validator = require('validator')
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
            if (!['male', 'female', 'other'].includes(value)) {
                throw new Error("Gender is not valid")
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://media.istockphoto.com/id/1326784308/vector/front-view-of-a-neutral-gender-human-body-silhouette.jpg?s=612x612&w=0&k=20&c=ZvZft2dFAxo56PP4GxOk6V3YXwE6SZxwRS8JF6hNPq8=",
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

// should start with capital letter only
const User = mongoose.model('User', userSchema);

module.exports = User;