require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const accounts_type_model   = db.accounts_type_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Accounts Type List
exports.accounts_type_list = async (req, res) => {
    try {
        const accounts_type = await accounts_type_model.findAll({
            where: {
                accounts_type_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    accounts_type_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        accounts_type_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        accounts_type_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['accounts_type_code', 'ASC']
            ]
        });

        if(accounts_type.length > 0) {
            const accounts_type_data = await Promise.all(accounts_type.map(async (row) => ({
                accounts_type_id          : row.accounts_type_id ,
                accounts_type_code        : row.accounts_type_code,
                accounts_type_name        : row.accounts_type_name,
                accounts_type_status      : row.accounts_type_status
            })));

            return res.send({
                status: "1",
                message: "Accounts Type Find Successfully!",
                data: accounts_type_data
            });
        }

        return res.send({
            status: "0",
            message: "Accounts Type Not Found !",
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

// Accounts Type List Active
exports.accounts_type_list_active = async (req, res) => {
    try {
        const accounts_type = await accounts_type_model.findAll({
            where: {
                accounts_type_status: 1,
                accounts_type_delete_status: 0
            },
            order: [
                ['accounts_type_code', 'ASC']
            ]
        });

        if(accounts_type.length > 0) {
            const accounts_type_data = await Promise.all(accounts_type.map(async (row) => ({
                accounts_type_id          : row.accounts_type_id ,
                accounts_type_code        : row.accounts_type_code,
                accounts_type_name        : row.accounts_type_name,
                accounts_type_status      : row.accounts_type_status
            })));

            return res.send({
                status: "1",
                message: "Accounts Type Find Successfully!",
                data: accounts_type_data
            });
        }
        return res.send({
            status: "0",
            message: "Accounts Type Not Found !",
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

// Get Accounts Type
exports.get_accounts_type = async (req, res) => {
    try {
        const data = await accounts_type_model.findOne({
            where: {
                accounts_type_id: req.params.accounts_type_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Accounts Type Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Accounts Type Find Successfully!",
            data: {
                accounts_type_id: data.accounts_type_id,
                accounts_type_code: data.accounts_type_code,
                accounts_type_name: data.accounts_type_name,
                accounts_type_status: data.accounts_type_status
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

// Accounts Type Create
exports.accounts_type_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const accounts_type = await accounts_type_model.create({
            accounts_type_code      : req.body.accounts_type_code,
            accounts_type_name      : req.body.accounts_type_name,
            accounts_type_status    : req.body.accounts_type_status,
            accounts_type_create_by : user_id,
        });

        if(accounts_type) {
            const data = await accounts_type_model.findOne({
                where: {
                    accounts_type_id: accounts_type.accounts_type_id
                },
            });

            return res.send({
                status: "1",
                message: "Accounts Type Create Successfully!",
                data: {
                    accounts_type_id: data.accounts_type_id,
                    accounts_type_code: data.accounts_type_code,
                    accounts_type_name: data.accounts_type_name,
                    accounts_type_status: data.accounts_type_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Accounts Type Create Error !",
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

// Accounts Type Update
exports.accounts_type_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const accounts_type_data = await accounts_type_model.findOne({
            where:{
                accounts_type_id: req.params.accounts_type_id
            }
        });

        if(!accounts_type_data) {
            return res.send({
                status: "0",
                message: "Accounts Type ID Not Found!",
                data: "",
            });
        }
        const accounts_type = await accounts_type_model.update({
            accounts_type_code      : req.body.accounts_type_code,
            accounts_type_name      : req.body.accounts_type_name,
            accounts_type_status    : req.body.accounts_type_status,
            accounts_type_update_by : user_id,
        },
        {
            where:{
                accounts_type_id: req.params.accounts_type_id
            }
        });
        if(accounts_type) {
            const data = await accounts_type_model.findOne({
                where: {
                    accounts_type_id: req.params.accounts_type_id
                },
            });

            return res.send({
                status: "1",
                message: "Accounts Type Update Successfully!",
                data: {
                    accounts_type_id: data.accounts_type_id,
                    accounts_type_code: data.accounts_type_code,
                    accounts_type_name: data.accounts_type_name,
                    accounts_type_status: data.accounts_type_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Accounts Type Update Error!",
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

// Accounts Type Delete
exports.accounts_type_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const accounts_type_data = await accounts_type_model.findOne({
            where:{
                accounts_type_id: req.params.accounts_type_id
            }
        });

        if(!accounts_type_data) {
            return res.send({
                status: "0",
                message: "Accounts Type ID Not Found!",
                data: "",
            });
        }

        const accounts_type = await accounts_type_model.update({
            accounts_type_status        : 0,
            accounts_type_delete_status : 1,
            accounts_type_delete_by     : user_id,
            accounts_type_delete_at     : new Date(),
        },
        {
            where:{
                accounts_type_id: req.params.accounts_type_id
            }
        });

        return res.send({
            status: "1",
            message: "Accounts Type Delete Successfully!",
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