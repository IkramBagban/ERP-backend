const jwt           = require("jsonwebtoken");
const config        = require("../config/config.js");
const db            = require("../models/");
const user_model    = db.user_model;

verify_token = (req, res, next) => {
    let token = req.headers["x-access-token"];
    // let token = req.headers["Authorization"];
    if (!token) {
        return res.send({
            message: "No Token Provided!",
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.send({
            message: "Unauthorized!",
            });
        }
        req.user_id = decoded.user_id;
        next();
    });
};

is_super_admin = async (req, res, next) => {
    try {
        const user = await user_model.findOne({where:{user_id:req.user_id, user_status:1, user_delete_status:0}});
        if (user.user_user_group == 1) {
            return next();
        }
        return res.send({
            message: "Require Super Admin Role!",
        });
    } catch (error) {
        return res.send({
            message: "Unable to Validate User Role!",
        });
    }
};

is_admin = async (req, res, next) => {
    try {
        const user = await user_model.findOne({where:{user_id:req.user_id, user_status:1, user_delete_status:0}});
        if (user.user_user_group == 1 || user.user_user_group == 2) {
                return next();
        }
        return res.send({
            message: "Require Admin Role!",
        });
    } catch (error) {
        return res.send({
            message: "Unable to Validate Admin Role!",
        });
    }
};

is_manager = async (req, res, next) => {
    try {
        const user = await user_model.findOne({where:{user_id:req.user_id, user_status:1, user_delete_status:0}});
        if (user.user_user_group == 1 || user.user_user_group == 2 || user.user_user_group == 3) {
                return next();
        }
        return res.send({
            message: "Require Manager Role!",
        });
    } catch (error) {
        return res.send({
            message: "Unable to Validate Manager Role!",
        });
    }
};

is_user = async (req, res, next) => {
    try {
        const user = await user_model.findOne({where:{user_id:req.user_id, user_status:1, user_delete_status:0}});
        if (user.user_user_group == 1 || user.user_user_group == 2 || user.user_user_group == 3 || user.user_user_group == 4) {
                return next();
        }
        return res.send({
            message: "Require User Role!",
        });
    } catch (error) {
        return res.send({
            message: "Unable to Validate User Role!",
        });
    }
};

const jwt_middleware = {
    verify_token,
    is_super_admin,
    is_admin,
    is_manager,
    is_user
};
module.exports = jwt_middleware;
