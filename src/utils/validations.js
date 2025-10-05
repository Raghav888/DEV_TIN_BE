const validator = require("validator")
const validateSignUpData = (req) => {
    const { firstName, lastName, emaildId, password } = req.body;
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
module.exports = { validateSignUpData, validateEmailIdAndPassword }