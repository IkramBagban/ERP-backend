require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const financial_year_model  = db.financial_year_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Financial Year List
exports.financial_year_list = async (req, res) => {
    try {
        const data = await financial_year_model.findOne({
            where: {
                financial_year_company: req.query.company,
                financial_year_delete_status: 0,
            },
            order: [
                ['financial_year_id', 'ASC']
            ]
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found !",
                data: '',
            });
        }

        const financial_year_data = {
            financial_year_id               : data.financial_year_id ,
            financial_year_starting_date    : data.financial_year_starting_date,
            financial_year_starting_month   : data.financial_year_starting_month,
            financial_year_closing_date     : data.financial_year_closing_date,
            financial_year_closing_month    : data.financial_year_closing_month,
            financial_year_status           : data.financial_year_status
        };

        return res.send({
            status: "1",
            message: "Financial Year Find Successfully!",
            data: financial_year_data
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: '',
        });
    }
};

// Financial Year List Active
exports.financial_year_list_active = async (req, res) => {
    try {
        const data = await financial_year_model.findOne({
            where: {
                financial_year_company: req.query.company,
                financial_year_status: 1,
                financial_year_delete_status: 0
            },
            order: [
                ['financial_year_id', 'ASC']
            ]
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found !",
                data: '',
            });
        }

        const financial_year_data = {
            financial_year_id               : data.financial_year_id ,
            financial_year_starting_date    : data.financial_year_starting_date,
            financial_year_starting_month   : data.financial_year_starting_month,
            financial_year_closing_date     : data.financial_year_closing_date,
            financial_year_closing_month    : data.financial_year_closing_month,
            financial_year_status           : data.financial_year_status
        };

        return res.send({
            status: "1",
            message: "Financial Year Find Successfully!",
            data: financial_year_data
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: '',
        });
    }
};

// Get Financial Year
exports.get_financial_year = async (req, res) => {
    try {
        const data = await financial_year_model.findOne({
            where: {
                financial_year_company: req.params.company
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found !",
                data: "",
            });
        }

        return res.send({
            status: "1",
            message: "Financial Year Find Successfully!",
            data: {
                financial_year_id               : data.financial_year_id ,
                financial_year_starting_date    : data.financial_year_starting_date,
                financial_year_starting_month   : data.financial_year_starting_month,
                financial_year_closing_date     : data.financial_year_closing_date,
                financial_year_closing_month    : data.financial_year_closing_month,
                financial_year_status           : data.financial_year_status
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

// Financial Year Create
exports.financial_year_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const s_month = new Date(req.body.financial_year_starting_month).getMonth();
        const c_month = new Date(req.body.financial_year_closing_month).getMonth()+1;
        const current_year = new Date().getFullYear();

        const s_date = new Date(current_year, s_month, 1);
        const c_date = new Date(current_year, c_month, 0);

        const starting_date     = new Date(s_date).toLocaleString('en-us',{day:'2-digit'},1);
        const starting_month    = new Date(req.body.financial_year_starting_month).toLocaleString('en-us',{month:'2-digit'});

        const closing_date      = new Date(c_date).toLocaleString('en-us',{day:'2-digit'});
        const closing_month     = new Date(req.body.financial_year_closing_month).toLocaleString('en-us',{month:'2-digit'});

        const data = await financial_year_model.findOne({
            where: {
                financial_year_company  : req.body.financial_year_company,
                financial_year_status   : 1
            }
        });

        if(data) {
            const update_data = await financial_year_model.update(
                {
                    financial_year_company          : req.body.financial_year_company,
                    financial_year_starting_date    : starting_date,
                    financial_year_starting_month   : starting_month,
                    financial_year_closing_date     : closing_date,
                    financial_year_closing_month    : closing_month,
                    financial_year_status           : 1,
                    financial_year_update_by        : user_id
                },
                {
                    where: {
                        financial_year_company  : req.body.financial_year_company,
                        financial_year_status   : 1,
                    }
                }
            );
            return res.status(200).send({
                status: "1",
                message: "Financial Year Update Successfully!",
                data: "",
            });
        } else {
            const create_data = await financial_year_model.create(
                {
                    financial_year_company          : req.body.financial_year_company,
                    financial_year_starting_date    : starting_date,
                    financial_year_starting_month   : starting_month,
                    financial_year_closing_date     : closing_date,
                    financial_year_closing_month    : closing_month,
                    financial_year_status           : 1,
                    financial_year_create_by        : user_id
                }
            );
            return res.status(200).send({
                status: "1",
                message: "Financial Year Create Successfully!",
                data: "",
            });
        }
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};