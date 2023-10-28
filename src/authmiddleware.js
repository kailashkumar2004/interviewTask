
const {User}=require("../src/model/model")
const jwt = require("jsonwebtoken");
const { secretKey } = require("../config");
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }
    const token = authHeader.substring("Bearer ".length);
    console.log("Received token:", token);
    const decoded = jwt.verify(token, secretKey);
    console.log("Decoded token:", decoded);
      const userData = await User.findOne({_id:decoded.id})
      console.log("userData======================",userData)
    if (!userData) {
      throw new Error("User data not found");
    }
    req.user = userData;
    return next();
  } catch (err) {
    console.error("Error in authenticate middleware:", err);
    const error = errorHandler(err, 401);
    return res.status(error.status).send(error);
  }
};
function errorHandler(error, status) {
  return {
      status: status || 500,
      message: error.message || "Internal Server Error",
  };
}
module.exports = {
  errorHandler,authenticate 
};