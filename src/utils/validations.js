const validator = require("validator")
const validateSignUpData = (req) => {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) throw new Error("First name or last name is missing");
}

const validateEmailIdAndPassword = (req) => {
    const { password, emailId } = req.body;
    if (!validator.isEmail(emailId)) {
        throw new Error("Please enter valid email id")
    }
    if (!password.length) {
        throw new Error("Please enter password")
    }
}

const validateEditProfileData = (req) => {
    // if the field doesnt exist in model then it will not add that in db
    // api level validation
    const ALLOWED_FIELD_TO_UPDATE = ['firstName', "lastName", "age", "photoUrl", "skills", "about"]
    return Object.keys(req.body).every(key => ALLOWED_FIELD_TO_UPDATE.includes(key));
}
module.exports = { validateSignUpData, validateEmailIdAndPassword, validateEditProfileData }