require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const user_model            = db.user_model;
const system_model          = db.system_model;

const Op                    = db.Sequelize.Op;
let user_id;

// System Setting
exports.system_setting = async (req, res) => {
    try {
        const data = await system_model.findOne({
            where: {
                system_status: 1
            }
        });

        if(!data) {
            return res.status(403).send({
                status: "0",
                message: "System Data Not Found!",
                data: "",
            });
        }

        return res.status(200).send({
            status: "1",
            message: "System Data Find Successfully!",
            data: {
                system_title    : data.system_title,
                system_name     : data.system_name,
                system_address  : data.system_address,
                system_phone    : data.system_phone,
                system_email    : data.system_email,
                system_website  : data.system_website,
                system_picture  : data.system_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${data.system_picture}`
            },
        });
    } catch (error) {
        res.status(500).send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// System Setting Create
exports.system_setting_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let system_picture;
        if (req.file == undefined) {
            system_picture = "assets/images/logo.png";
        } else {
            system_picture = "assets/images/"+req.file.filename;
        }

        const data = await system_model.findOne({
            where: {
                system_status: 1
            }
        });

        if(data) {
            const create_data = await system_model.update(
                {
                    system_title    : req.body.system_title,
                    system_name     : req.body.system_name,
                    system_address  : req.body.system_address,
                    system_phone    : req.body.system_phone,
                    system_email    : req.body.system_email,
                    system_website  : req.body.system_website,
                    system_update_by: user_id
                },
                {
                    where: {
                        system_status: 1
                    }
                }
            );
            return res.status(200).send({
                status: "1",
                message: "System Update Successfully!",
                data: "",
            });
        } else {
            const update_data = await system_model.create(
                {
                    system_title    : req.body.system_title,
                    system_name     : req.body.system_name,
                    system_address  : req.body.system_address,
                    system_phone    : req.body.system_phone,
                    system_email    : req.body.system_email,
                    system_website  : req.body.system_website,
                    system_picture  : "assets/images/logo.png",
                    system_create_by: user_id
                }
            );
            return res.status(200).send({
                status: "1",
                message: "System Create Successfully!",
                data: "",
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// System Logo Change
exports.system_logo_change = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let system_picture;
        if (req.file == undefined) {
            system_picture = "assets/images/logo.png";
        } else {
            system_picture = "assets/images/"+req.file.filename;
        }

        const data = await system_model.findOne({
            where: {
                system_status: 1
            }
        });

        if(data) {
            const create_data = await system_model.update(
                {
                    system_picture  : system_picture,
                    system_update_by: user_id
                },
                {
                    where: {
                        system_status: 1
                    }
                }
            );
            return res.status(200).send({
                status: "1",
                message: "System Logo Change Successfully!",
                data: "",
            });
        } else {
            const update_data = await system_model.create(
                {
                    system_picture  : system_picture,
                    system_create_by: user_id
                }
            );
            return res.status(200).send({
                status: "1",
                message: "System Logo Upload Successfully!",
                data: "",
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Get User Language
exports.get_user_language = async (req, res) => {
    try {
        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data) {
            return res.status(403).send({
                status: "1",
                message: "User ID Not Found!",
                data: "",
            });
        } else {
            return res.status(200).send({
                status: "1",
                message: "User Language Found Successfully!",
                data: {
                    user_language: data.user_language
                },
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Change User Language
exports.change_user_language = async (req, res) => {
    try {
        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data) {
            return res.status(403).send({
                status: "1",
                message: "User ID Not Found!",
                data: "",
            });
        } else {
            const user_update = await user_model.update(
            {
                user_language: req.body.user_language
            },
            {
                where: {
                    user_id: req.params.user_id
                }
            });

            return res.status(200).send({
                status: "1",
                message: "User Language Change Successfully!",
                data: ""
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Get User Theme
exports.get_user_theme = async (req, res) => {
    try {
        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data) {
            return res.status(403).send({
                status: "1",
                message: "User ID Not Found!",
                data: "",
            });
        } else {
            return res.status(200).send({
                status: "1",
                message: "User Theme Found Successfully!",
                data: {
                    user_language: data.user_theme
                }
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Change User Theme
exports.change_user_theme = async (req, res) => {
    try {
        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data) {
            return res.status(403).send({
                status: "1",
                message: "User ID Not Found!",
                data: "",
            });
        } else {
            const user_update = await user_model.update(
            {
                user_theme: req.body.user_theme
            },
            {
                where: {
                    user_id: req.params.user_id
                }
            });

            return res.status(200).send({
                status: "1",
                message: "User Theme Change Successfully!",
                data: "",
            });
        }
    } catch (error) {
        res.status(500).send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};