const mongoose = require("mongoose");
const { secretKey } = require("../../config");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    Email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String
    },
    otp: {
        type: String,
        default: 0,
      },
      otp2: {
        type: String,
        default: 0,
      },
});
userSchema.statics.findByToken = async function (token) {
    try {
        const decodedToken = jwt.verify(token, secretKey);
        if (!decodedToken) {
            throw "invalited token find"
        };
        const user = await this.findByToken(decodedToken.id);
        if (!user) {
            throw "token not find"
        };
        return user
    } catch (error) {
        throw "error token find"
    }
};
userSchema.methods.comparePassword = async function (interedPassword) {
    return bcrypt.compare(interedPassword, this.password)
};
const User = mongoose.model("User", userSchema);
module.exports={User}