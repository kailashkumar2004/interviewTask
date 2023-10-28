const mongoose = require("mongoose");
const express = require("express");
const { User } = require("../src/model/model");
const { secretKey } = require("../config");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authenticate } = require("./authmiddleware");


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
module.exports=router