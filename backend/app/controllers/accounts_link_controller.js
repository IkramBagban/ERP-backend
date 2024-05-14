require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const accounts_link_model   = db.accounts_link_model;
const chart_of_accounts_model   = db.chart_of_accounts_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Accounts Link List
exports.accounts_link_list = async (req, res) => {
    try {
        const accounts_link = await accounts_link_model.findAll({
            include : [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: accounts_link_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_link_accounts",
                        required:false
                    }),
                }
            ],
            where: {
                accounts_link_delete_status: 0,
                accounts_link_company: req.query.company,
                ...(req.query.status == 'all' ?{}:{
                    accounts_link_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        accounts_link_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        accounts_link_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['accounts_link_id', 'ASC']
            ]
        });

        if(accounts_link.length > 0) {
            const accounts_link_data = await Promise.all(accounts_link.map(async (row) => ({
                accounts_link_id          : row.accounts_link_id ,
                accounts_link_code        : row.accounts_link_code,
                accounts_link_name        : row.accounts_link_name,
                accounts_link_accounts    : row.accounts_link_accounts,
                accounts_link_accounts_code : row.chart_of_account !==null?row.chart_of_account.chart_of_accounts_code : '',
                accounts_link_accounts_name : row.chart_of_account !==null?row.chart_of_account.chart_of_accounts_name : '',
                accounts_link_status      : row.accounts_link_status
            })));

            return res.send({
                status: "1",
                message: "Accounts Link Find Successfully!",
                data: accounts_link_data
            });
        }

        return res.send({
            status: "0",
            message: "Accounts Link Not Found !",
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

// Accounts Link List Active
exports.accounts_link_list_active = async (req, res) => {
    try {
        const accounts_link = await accounts_link_model.findAll({
            include : [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: accounts_link_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_link_accounts",
                        required:false
                    }),
                }
            ],
            where: {
                accounts_link_status: 1,
                accounts_link_delete_status: 0,
                accounts_link_company: req.query.company,
            },
            order: [
                ['accounts_link_id', 'ASC']
            ]
        });

        if(accounts_link.length > 0) {
            const accounts_link_data = await Promise.all(accounts_link.map(async (row) => ({
                accounts_link_id          : row.accounts_link_id ,
                accounts_link_code        : row.accounts_link_code,
                accounts_link_name        : row.accounts_link_name,
                accounts_link_accounts    : row.accounts_link_accounts,
                accounts_link_accounts_code : row.chart_of_account !==null?row.chart_of_account.chart_of_accounts_code : '',
                accounts_link_accounts_name : row.chart_of_account !==null?row.chart_of_account.chart_of_accounts_name : '',
                accounts_link_status      : row.accounts_link_status
            })));

            return res.send({
                status: "1",
                message: "Accounts Link Find Successfully!",
                data: accounts_link_data
            });
        }
        return res.send({
            status: "0",
            message: "Accounts Link Not Found !",
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

// Get Accounts Link
exports.get_accounts_link = async (req, res) => {
    try {
        const data = await accounts_link_model.findOne({
            include : [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: accounts_link_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_link_accounts",
                        required:false
                    }),
                }
            ],
            where: {
                accounts_link_id: req.params.accounts_link_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Accounts Link Not Found !",
                data: "",
            });
        }

        return res.send({
            status: "1",
            message: "Accounts Link Find Successfully!",
            data: {
                accounts_link_id            : data.accounts_link_id ,
                accounts_link_code          : data.accounts_link_code,
                accounts_link_name          : data.accounts_link_name,
                accounts_link_accounts      : data.accounts_link_accounts,
                accounts_link_accounts_code : data.chart_of_account !==null?data.chart_of_account.chart_of_accounts_code : '',
                accounts_link_accounts_name : data.chart_of_account !==null?data.chart_of_account.chart_of_accounts_name : '',
                accounts_link_status        : data.accounts_link_status
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

// Accounts Link Create
exports.accounts_link_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const accounts_link = await accounts_link_model.create({
            accounts_link_company   : req.body.accounts_link_company,
            accounts_link_code      : req.body.accounts_link_code,
            accounts_link_name      : req.body.accounts_link_name,
            accounts_link_accounts  : req.body.accounts_link_accounts,
            accounts_link_status    : req.body.accounts_link_status,
            accounts_link_create_by : user_id,
        });

        if(accounts_link) {
            const data = await accounts_link_model.findOne({
                include : [
                    {
                        model: chart_of_accounts_model,
                        attributes: ['chart_of_accounts_code', 'chart_of_accounts_name'],
                        association: accounts_link_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_link_accounts",
                            required:false
                        }),
                    }
                ],
                where: {
                    accounts_link_id: accounts_link.accounts_link_id
                },
            });

            return res.send({
                status: "1",
                message: "Accounts Link Create Successfully!",
                data: {
                    accounts_link_id            : data.accounts_link_id ,
                    accounts_link_code          : data.accounts_link_code,
                    accounts_link_name          : data.accounts_link_name,
                    accounts_link_accounts      : data.accounts_link_accounts,
                    accounts_link_accounts_code : data.chart_of_account !==null?data.chart_of_account.chart_of_accounts_code : '',
                    accounts_link_accounts_name : data.chart_of_account !==null?data.chart_of_account.chart_of_accounts_name : '',
                    accounts_link_status        : data.accounts_link_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Accounts Link Create Error !",
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

// Accounts Link Update
exports.accounts_link_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const accounts_link_data = await accounts_link_model.findOne({
            where:{
                accounts_link_id: req.params.accounts_link_id
            }
        });

        if(!accounts_link_data) {
            return res.send({
                status: "0",
                message: "Accounts Link ID Not Found!",
                data: "",
            });
        }
        const accounts_link = await accounts_link_model.update({
            accounts_link_company   : req.body.accounts_link_company,
            accounts_link_code      : req.body.accounts_link_code,
            accounts_link_name      : req.body.accounts_link_name,
            accounts_link_accounts  : req.body.accounts_link_accounts,
            accounts_link_status    : req.body.accounts_link_status,
            accounts_link_update_by : user_id,
        },
        {
            where:{
                accounts_link_id: req.params.accounts_link_id
            }
        });
        if(accounts_link) {
            const data = await accounts_link_model.findOne({
                include : [
                    {
                        model: chart_of_accounts_model,
                        attributes: ['chart_of_accounts_code', 'chart_of_accounts_name'],
                        association: accounts_link_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_link_accounts",
                            required:false
                        }),
                    }
                ],
                where: {
                    accounts_link_id: req.params.accounts_link_id
                },
            });

            return res.send({
                status: "1",
                message: "Accounts Link Update Successfully!",
                data: {
                    accounts_link_id            : data.accounts_link_id ,
                    accounts_link_code          : data.accounts_link_code,
                    accounts_link_name          : data.accounts_link_name,
                    accounts_link_accounts      : data.accounts_link_accounts,
                    accounts_link_accounts_code : data.chart_of_account !==null?data.chart_of_account.chart_of_accounts_code : '',
                    accounts_link_accounts_name : data.chart_of_account !==null?data.chart_of_account.chart_of_accounts_name : '',
                    accounts_link_status        : data.accounts_link_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Accounts Link Update Error!",
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

// Accounts Link Delete
exports.accounts_link_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const accounts_link_data = await accounts_link_model.findOne({
            where:{
                accounts_link_id: req.params.accounts_link_id
            }
        });

        if(!accounts_link_data) {
            return res.send({
                status: "0",
                message: "Accounts Link ID Not Found!",
                data: "",
            });
        }

        const accounts_link = await accounts_link_model.update({
            accounts_link_status        : 0,
            accounts_link_delete_status : 1,
            accounts_link_delete_by     : user_id,
            accounts_link_delete_at     : new Date(),
        },
        {
            where:{
                accounts_link_id: req.params.accounts_link_id
            }
        });

        return res.send({
            status: "1",
            message: "Accounts Link Delete Successfully!",
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