require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const voucher_type_model   = db.voucher_type_model;
const Op                   = db.Sequelize.Op;
let user_id;


// Voucher Type List
exports.voucher_type_list = async (req, res) => {
    try {
        const voucher_type = await voucher_type_model.findAll({
            where: {
                voucher_type_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    voucher_type_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        voucher_type_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        voucher_type_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['voucher_type_id', 'ASC']
            ]
        });

        if(voucher_type.length > 0) {
            const voucher_type_data = await Promise.all(voucher_type.map(async (row) => ({
                voucher_type_id          : row.voucher_type_id ,
                voucher_type_code        : row.voucher_type_code,
                voucher_type_name        : row.voucher_type_name,
                voucher_type_status      : row.voucher_type_status
            })));

            return res.send({
                status: "1",
                message: "Voucher Type Find Successfully!",
                data: voucher_type_data
            });
        }

        return res.send({
            status: "0",
            message: "Voucher Type Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Voucher Type List Active
exports.voucher_type_list_active = async (req, res) => {
    try {
        const voucher_type = await voucher_type_model.findAll({
            where: {
                voucher_type_status: 1,
                voucher_type_delete_status: 0
            },
            order: [
                ['voucher_type_id', 'ASC']
            ]
        });

        if(voucher_type.length > 0) {
            const voucher_type_data = await Promise.all(voucher_type.map(async (row) => ({
                voucher_type_id          : row.voucher_type_id ,
                voucher_type_code        : row.voucher_type_code,
                voucher_type_name        : row.voucher_type_name,
                voucher_type_status      : row.voucher_type_status
            })));

            return res.send({
                status: "1",
                message: "Voucher Type Find Successfully!",
                data: voucher_type_data
            });
        }
        return res.send({
            status: "0",
            message: "Voucher Type Not Found !",
            data: [],
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Voucher Type
exports.get_voucher_type = async (req, res) => {
    try {
        const data = await voucher_type_model.findOne({
            where: {
                voucher_type_id: req.params.voucher_type_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Voucher Type Not Found !",
                data: "",
            });
            
        }

        return res.send({
            status: "1",
            message: "Voucher Type Find Successfully!",
            data: {
                voucher_type_id: data.voucher_type_id,
                voucher_type_code: data.voucher_type_code,
                voucher_type_name: data.voucher_type_name,
                voucher_type_status: data.voucher_type_status
            }
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data:"",
        });
    }
};

// Voucher Type Create
exports.voucher_type_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const voucher_type = await voucher_type_model.create({
            voucher_type_code      : req.body.voucher_type_code,
            voucher_type_name      : req.body.voucher_type_name,
            voucher_type_status    : req.body.voucher_type_status,
            voucher_type_create_by : user_id,
        });

        if(voucher_type) {
            const data = await voucher_type_model.findOne({
                where: {
                    voucher_type_id: voucher_type.voucher_type_id
                },
            });

            return res.send({
                status: "1",
                message: "Voucher Type Create Successfully!",
                data: {
                    voucher_type_id: data.voucher_type_id,
                    voucher_type_code: data.voucher_type_code,
                    voucher_type_name: data.voucher_type_name,
                    voucher_type_status: data.voucher_type_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Voucher Type Create Error !",
            data: "",
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Voucher Type Update
exports.voucher_type_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const voucher_type_data = await voucher_type_model.findOne({
            where:{
                voucher_type_id: req.params.voucher_type_id
            }
        });

        if(!voucher_type_data) {
            return res.send({
                status: "0",
                message: "Voucher Type ID Not Found!",
                data: "",
            });
        }
        const voucher_type = await voucher_type_model.update({
            voucher_type_code      : req.body.voucher_type_code,
            voucher_type_name      : req.body.voucher_type_name,
            voucher_type_status    : req.body.voucher_type_status,
            voucher_type_update_by : user_id,
        },
        {
            where:{
                voucher_type_id: req.params.voucher_type_id
            }
        });
        if(voucher_type) {
            const data = await voucher_type_model.findOne({
                where: {
                    voucher_type_id: req.params.voucher_type_id
                },
            });

            return res.send({
                status: "1",
                message: "Voucher Type Update Successfully!",
                data: {
                    voucher_type_id: data.voucher_type_id,
                    voucher_type_code: data.voucher_type_code,
                    voucher_type_name: data.voucher_type_name,
                    voucher_type_status: data.voucher_type_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Voucher Type Update Error!",
            data: ""
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Voucher Type Delete
exports.voucher_type_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const voucher_type_data = await voucher_type_model.findOne({
            where:{
                voucher_type_id: req.params.voucher_type_id
            }
        });

        if(!voucher_type_data) {
            return res.send({
                status: "0",
                message: "Voucher Type ID Not Found!",
                data: "",
            });
        }

        const voucher_type = await voucher_type_model.update({
            voucher_type_status        : 0,
            voucher_type_delete_status : 1,
            voucher_type_delete_by     : user_id,
            voucher_type_delete_at     : new Date(),
        },
        {
            where:{
                voucher_type_id: req.params.voucher_type_id
            }
        });

        return res.send({
            status: "1",
            message: "Voucher Type Delete Successfully!",
            data: ""
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};