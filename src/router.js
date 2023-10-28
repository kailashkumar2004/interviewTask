const mongoose = require("mongoose");
const express = require("express");
const { User } = require("../src/model/model");
const { secretKey } = require("../config");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authenticate } = require("./authmiddleware");


const nodemailer = require('nodemailer');

// Create a Nodemailer transporter using a Gmail account
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'kabita20@navgurukul.org',
    pass: 'navgurukul'
  }
});

// Generate a random OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
};

// Compose the email
const otp = generateOTP();
const mailOptions = {
  from: 'kailashkumartkg@gmail.com',
  to: 'kabita20@navgurukul.org',
  subject: 'Your OTP Code',
  text: `Your OTP code is: ${otp}`
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email: ' + error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

let sendEmailForOTP = async (req, messageObj) => {
  console.log("req------", req)
  console.log("messageObj--in --sendMessage-----", messageObj)

  try {
    let info = await transporter.sendMail({
        from: 'kailashkumartkg@gmail.com',
        to: req.Email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`

    });
    if (info) {
      return info.messageId;
    } else {
      console.log("error");
    }
  } catch (err) {
    console.log(err);
  }
};


// let sendOTP = async (data) => {
router.post("/sendOTP", async (req, res) => {

    console.log("data------------->", req.body)
    let OTP = Math.floor(1000 + Math.random() * 999).toString();
    let user = await User.findOne({ Email: req.body.Email, isEmailVerified: true });
    // if (user) throw msg.duplicateEmail;
  
    console.log("user===", user)
    if (user && user.password) throw msg.duplicateEmail;
  
    // let user1 = await User.findOne({ Email: req.body.Email, isEmailVerified: false });
    let user1 = await User.findOne({ Email: req.body.Email});

    console.log("user1---", user1)
    if (user1) {
        let abc = await sendEmailForOTP(req.body.Email, OTP);
        if (abc) {
            let otptxt = CryptoJS.AES.encrypt(
                OTP,
                process.env.secret_key
            ).toString();
            console.log('otp------------->', OTP);
            let newDate = new Date();
            let u = await User.findOneAndUpdate({ Email: req.body.Email }, { $set: { otp: otptxt, otpDate: newDate } }, { new: true });
            if (!u) throw msg.NotExist;
            return {
                result: msg.success,
            };
        }
    }
    if (user) {
        let abc = await sendEmailForOTP(req.body.Email, OTP, "resend");
        if (abc) {
            let otptxt = CryptoJS.AES.encrypt(
                OTP,
                process.env.secret_key
            ).toString();
            console.log('otp--------->', OTP);
            let newDate = new Date();
            let u = await User.findOneAndUpdate({ Email: req.body.Email }, { $set: { otp: otptxt, otpDate: newDate } }, { new: true });
            console.log("u-----", u)
            if (!u) throw msg.NotExist;
            return {
                result: msg.success,
            };
        }
    }
  
    let updateUserdb;
    if (req.body.Email) {
        let abc = await sendEmailForOTP(req.body.Email, OTP, "verify");
        console.log("abc", abc)
        if (abc) {
            let ciphertext = CryptoJS.AES.encrypt(
                OTP,
                secretKey
            ).toString();
            console.log('otp--------->', OTP);
            let newDate = new Date();
            req.body = {
                "email": req.body.Email,
                "otpDate": newDate,
                "otp": ciphertext
            }
            var userData = new User(body);
  
            updateUserdb = await userData.save();
            if (updateUserdb) {
                return {
                    result: msg.success,
                };
            }
        }
    }
  
})



router.post("/emailVerify", async (req, res) => {

    if (!req.body.otp) throw msg.requiredOtp;
    if (!req.body.Email) throw msg.invalidEmail;
    let user = await User.findOne({ Email: req.body.Email });
    if (!user) throw msg.UsernotExist;
    let date1 = user.otpDate;
    let date1Time = date1.getTime();
    let date2 = new Date();
    let date2Time = date2.getTime();
    let minutes = (date2Time - date1Time) / (1000 * 60);
    if (minutes > 1) throw msg.expireOtp;
  
    let ciphertext = CryptoJS.AES.decrypt(
      user.otp,
      secretKey
    ).toString(CryptoJS.enc.Utf8);
  
    if (ciphertext == req.body.otp) {
      let res = await User.findByIdAndUpdate(user._id, { $set: { isEmailVerified: true } });
      return {
        message: msg.success
      };
    } else throw msg.incorrectOTP;
  });



router.post("/register", async (req, res) => {
    try {
        const newdata = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            Email: req.body.Email,
            password: req.body.password
        };
        console.log("newdata==========================", newdata);
        const existingUser = await User.findOne({ Email: req.body.Email });
        console.log("existingUser=================", existingUser);
        if (existingUser) {
            return res.status(401).json({
                msg: "email allready register"
            });
        };
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        newdata.password = hashedPassword;

        const userData = new User(newdata);
        const data1 = await userData.save();

        return res.status(200).json({
            msg: "registered data successfully",
            result: data1
        });
    } catch (error) {
        console.log("error=======================", error);
        res.status(500).json({
            msg: "error data find",
            error: error.message
        });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { Email, password } = req.body;
        const existingUser = await User.findOne({ Email: req.body.Email });
        console.log("existingUser=======================", existingUser);
        if (!existingUser) {
            return res.status(401).json({
                msg: "invalited email find"
            });
        };
        const isPasswordMath = await bcrypt.compare(password, existingUser.password);
        console.log("isPasswordMath=====================", isPasswordMath);
        if (!isPasswordMath) {
            return res.status(401).json({
                msg: "invalited password find"
            });
        };
        const token = jwt.sign({ id: existingUser._id.toString() }, secretKey);

        return res.status(200).json({
            msg: "login success",
            user: existingUser,
            token
        });
    } catch (error) {
        console.log("error=========================", error);
        res.status(500).json({
            msg: "error data find",
            error: error.message
        });
    }
});
router.get("/getDataByUserToken", authenticate, async (req, res) => {
    try {
        const UserId = req.user.id;
        console.log("UserId=================", UserId);
        const getdata = await User.findOne({ _id: UserId });
        console.log("getdata==============", getdata);
        if (!getdata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "getdata success",
            result: getdata
        });
    } catch (error) {
        console.log("error===================", error);
        res.status(500).json({
            msg: "error data find",
            error: error.messge
        });
    }
});
router.put("/updateDataByUserToken", authenticate, async (req, res) => {
    try {
        const UserId = req.user.id;
        console.log("UserId================", UserId);
        const data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        };
        console.log("data=========================", data);
        const updatedata = await User.findByIdAndUpdate(UserId, { $set: data }, { new: true });
        console.log("updatedata==================", updatedata);
        if (!updatedata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "updatedata success",
            result: updatedata
        });
    } catch (error) {
        console.log("error==================", error);
        res.status(500).json({
            msg: "error data find",
            error: error.message
        });
    }
});
router.delete("/deleteDataByUserToken", authenticate, async (req, res) => {
    try {
        const UserId = req.user.id;
        console.log("UserId================", UserId);
        const deletedata = await User.findByIdAndDelete(UserId);
        console.log("deletedata=================", deletedata);
        if (!deletedata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "deletedata successfully",
            result: deletedata
        });
    } catch (error) {
        console.log("error====================", error);
        res.status(500).json({
            msg: "error data find",
            error: error.message
        });
    }
});



router.post('/forgot-password', async (req, res) => {
    try {
      const { Email } = req.body;
  
      // Check if the provided email exists
      const user = await User.findOne({ Email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      const resetToken = generateSecureToken();
  
      user.resetPasswordToken = resetToken;
      user.resetPasswordTokenExpiry = Date.now() + 3600000;
      await user.save();
    //   const resetLink = `https://yourwebsite.com/reset-password/${resetToken}`;
  
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'kailashkumartkg@gmail.com',
          pass: 'kailash@12345',
        },
      });
  
      const mailOptions = {
        from: 'kailashkumartkg@gmail.com',
        to:req.body.Email,
        subject: 'Password Reset Request',
        // text: `To reset your password, click on the following link: ${resetLink}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error sending reset link.' });
    }
  });
  
  
  
router.put('/reset-password', async (req, res) => {
    try {
      const { Email, oldPassword, newPassword, confirmPassword } = req.body;
  
      // Check if the required fields are provided
      if (!Email || !oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "msg.incompleteData" });
      }
  
      // Find the user by their email
      const user = await User.findOne({ Email });
  
      if (!user) {
        return res.status(404).json({ message: "msg.userNotFound" });
      }
  
      // Verify the old password
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "msg.wrongPassword" });
      }
  
      // Verify that the new password and confirmPassword match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message:" msg.passwordMismatch" });
      }
  
      // Hash the new password and update it in the database
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
  
      // Save the user with the updated password
      await user.save();
  
      return res.status(200).json({ message: "passwordResetSuccess" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message:"internalServerError" });
    }
  });


module.exports=router