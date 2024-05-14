require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const company_package_model = db.company_package_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Company Package List
exports.company_package_list = async (req, res) => {
    try {
        const company_package = await company_package_model.findAll({
            where: {
                company_package_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    company_package_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        company_package_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_package_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['company_package_id', 'ASC']
            ]
        });

        if(company_package.length > 0) {
            const company_package_data = await Promise.all(company_package.map(async (row) => ({
                company_package_id          : row.company_package_id ,
                company_package_code        : row.company_package_code,
                company_package_name        : row.company_package_name,
                company_package_status      : row.company_package_status
            })));

            return res.send({
                status: "1",
                message: "Company Package Find Successfully!",
                data: company_package_data
            });
        }

        return res.send({
            status: "0",
            message: "Company Package Not Found !",
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

// Company Package List Active
exports.company_package_list_active = async (req, res) => {
    try {
        const company_package = await company_package_model.findAll({
            where: {
                company_package_status: 1,
                company_package_delete_status: 0
            },
            order: [
                ['company_package_id', 'ASC']
            ]
        });

        if(company_package.length > 0) {
            const company_package_data = await Promise.all(company_package.map(async (row) => ({
                company_package_id          : row.company_package_id ,
                company_package_code        : row.company_package_code,
                company_package_name        : row.company_package_name,
                company_package_status      : row.company_package_status
            })));

            return res.send({
                status: "1",
                message: "Company Package Find Successfully!",
                data: company_package_data
            });
        }
        return res.send({
            status: "0",
            message: "Company Package Not Found !",
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

// Get Company Package
exports.get_company_package = async (req, res) => {
    try {
        const data = await company_package_model.findOne({
            where: {
                company_package_id: req.params.company_package_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Company Package Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Company Package Find Successfully!",
            data: {
                company_package_id: data.company_package_id,
                company_package_code: data.company_package_code,
                company_package_name: data.company_package_name,
                company_package_status: data.company_package_status
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

// Company Package Create
exports.company_package_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const company_package = await company_package_model.create({
            company_package_code      : req.body.company_package_code,
            company_package_name      : req.body.company_package_name,
            company_package_status    : req.body.company_package_status,
            company_package_create_by : user_id,
        });

        if(company_package) {
            const data = await company_package_model.findOne({
                where: {
                    company_package_id: company_package.company_package_id
                },
            });

            return res.send({
                status: "1",
                message: "Company Package Create Successfully!",
                data: {
                    company_package_id: data.company_package_id,
                    company_package_code: data.company_package_code,
                    company_package_name: data.company_package_name,
                    company_package_status: data.company_package_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Company Package Create Error !",
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

// Company Package Update
exports.company_package_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const company_package_data = await company_package_model.findOne({
            where:{
                company_package_id: req.params.company_package_id
            }
        });

        if(!company_package_data) {
            return res.send({
                status: "0",
                message: "Company Package ID Not Found!",
                data: "",
            });
        }
        const company_package = await company_package_model.update({
            company_package_code      : req.body.company_package_code,
            company_package_name      : req.body.company_package_name,
            company_package_status    : req.body.company_package_status,
            company_package_update_by : user_id,
        },
        {
            where:{
                company_package_id: req.params.company_package_id
            }
        });
        if(company_package) {
            const data = await company_package_model.findOne({
                where: {
                    company_package_id: req.params.company_package_id
                },
            });

            return res.send({
                status: "1",
                message: "Company Package Update Successfully!",
                data: {
                    company_package_id: data.company_package_id,
                    company_package_code: data.company_package_code,
                    company_package_name: data.company_package_name,
                    company_package_status: data.company_package_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Company Package Update Error!",
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

// Company Package Delete
exports.company_package_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const company_package_data = await company_package_model.findOne({
            where:{
                company_package_id: req.params.company_package_id
            }
        });

        if(!company_package_data) {
            return res.send({
                status: "0",
                message: "Company Package ID Not Found!",
                data: "",
            });
        }

        const company_package = await company_package_model.update({
            company_package_status        : 0,
            company_package_delete_status : 1,
            company_package_delete_by     : user_id,
            company_package_delete_at     : new Date(),
        },
        {
            where:{
                company_package_id: req.params.company_package_id
            }
        });

        return res.send({
            status: "1",
            message: "Company Package Delete Successfully!",
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