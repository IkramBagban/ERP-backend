require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const accounts_type_model= db.accounts_type_model;
const chart_of_accounts_model= db.chart_of_accounts_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Chart of Accounts List
exports.chart_of_accounts_list = async (req, res) => {
    try {

        const get_subsidiary_ledger = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.query.company,
                    ...(req.query.status == 'all' ?{}:{
                        chart_of_accounts_status : req.query.status
                    }),
                    ...(req.query.search.length > 0?{
                        [Op.or]: [
                        {
                            chart_of_accounts_code: {[Op.like]: `%${req.query.search}%`}
                        },
                        {
                            chart_of_accounts_name:{[Op.like]: `%${req.query.search}%`}
                        }
                    ]
                    }:{})
                }
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
            })));
            return data || [];
        }

        const get_general_ledger = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.query.company,
                    ...(req.query.status == 'all' ?{}:{
                        chart_of_accounts_status : req.query.status
                    }),
                    ...(req.query.search.length > 0?{
                        [Op.or]: [
                        {
                            chart_of_accounts_code: {[Op.like]: `%${req.query.search}%`}
                        },
                        {
                            chart_of_accounts_name:{[Op.like]: `%${req.query.search}%`}
                        }
                    ]
                    }:{})
                }
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
                subsidiary_ledger                   : await get_subsidiary_ledger(row.chart_of_accounts_id),
            })));
            return data || [];
        }

        const get_control_group = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.query.company,
                    ...(req.query.status == 'all' ?{}:{
                        chart_of_accounts_status : req.query.status
                    }),
                    ...(req.query.search.length > 0?{
                        [Op.or]: [
                        {
                            chart_of_accounts_code: {[Op.like]: `%${req.query.search}%`}
                        },
                        {
                            chart_of_accounts_name:{[Op.like]: `%${req.query.search}%`}
                        }
                    ]
                    }:{})
                }
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
                general_ledger                       : await get_general_ledger(row.chart_of_accounts_id),
            })));
            return data || [];
        }

        const get_accounts_category = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.query.company,
                    ...(req.query.status == 'all' ?{}:{
                        chart_of_accounts_status : req.query.status
                    }),
                    ...(req.query.search.length > 0?{
                        [Op.or]: [
                        {
                            chart_of_accounts_code: {[Op.like]: `%${req.query.search}%`}
                        },
                        {
                            chart_of_accounts_name:{[Op.like]: `%${req.query.search}%`}
                        }
                    ]
                    }:{})
                }
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
                control_group                       : await get_control_group(row.chart_of_accounts_id),
            })));
            return data || [];
        }

        const accounts_type = await accounts_type_model.findAll({
            where: {
                accounts_type_delete_status:0,
                ...(req.query.status == 'all' ?{}:{
                    accounts_type_status : req.query.status
                }),
                // ...(req.query.search.length > 0?{
                //     [Op.or]: [
                //     {
                //         accounts_type_code: {[Op.like]: `%${req.query.search}%`}
                //     },
                //     {
                //         accounts_type_name:{[Op.like]: `%${req.query.search}%`}
                //     }
                // ]
                // }:{})
            },
            order: [
                ['accounts_type_code', 'ASC']
            ]
        });

        if(accounts_type.length > 0) {
            const accounts_type_data = await Promise.all(accounts_type.map(async (row) => ({
                chart_of_accounts_id        : row.accounts_type_id ,
                chart_of_accounts_code      : row.accounts_type_code,
                chart_of_accounts_name      : row.accounts_type_name,
                chart_of_accounts_status    : row.accounts_type_status,
                accounts_category           : await get_accounts_category(row.accounts_type_id),
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: accounts_type_data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
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

// Chart of Accounts Search
exports.chart_of_accounts_search = async (req, res) => {
    try {

        const coa = await chart_of_accounts_model.findAll({
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: chart_of_accounts_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "chart_of_accounts_accounts_category",
                        required:false
                    })
                }
            ],
            where:{
                chart_of_accounts_delete_status: 0,
                chart_of_accounts_status: 1,
                chart_of_accounts_company: req.query.company,
                chart_of_accounts_coa_status: 'subsidiary_ledger',
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        chart_of_accounts_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        chart_of_accounts_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            limit:50,
            order: [
                ['chart_of_accounts_code', 'ASC'],
                ['chart_of_accounts_name', 'ASC']
            ]
        });
        if(coa.length > 0) {
            const coa_data = await Promise.all(coa.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_code_gl           : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name_gl           : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: coa_data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
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

// Chart of Accounts List Active
exports.chart_of_accounts_list_active = async (req, res) => {
    try {

        const get_subsidiary_ledger = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.params.company,
                    chart_of_accounts_status:1
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
            })));
            return data || [];
        }

        const get_general_ledger = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.params.company,
                    chart_of_accounts_status:1
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
                subsidiary_ledger                   : await get_subsidiary_ledger(row.chart_of_accounts_id),
            })));
            return data || [];
        }

        const get_control_group = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.params.company,
                    chart_of_accounts_status:1
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
                general_ledger                       : await get_general_ledger(row.chart_of_accounts_id),
            })));
            return data || [];
        }

        const get_accounts_category = async(accounts_id) => {
            const coa_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_accounts_category: accounts_id,
                    chart_of_accounts_delete_status: 0,
                    chart_of_accounts_company: req.params.company,
                    chart_of_accounts_status:1
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status,
                control_group                       : await get_control_group(row.chart_of_accounts_id),
            })));
            return data || [];
        }

        const accounts_type = await accounts_type_model.findAll({
            where: {
                accounts_type_delete_status:0,
                accounts_type_status:1
            },
            order: [
                ['accounts_type_code', 'ASC']
            ]
        });

        if(accounts_type.length > 0) {
            const accounts_type_data = await Promise.all(accounts_type.map(async (row) => ({
                chart_of_accounts_id        : row.accounts_type_id ,
                chart_of_accounts_code      : row.accounts_type_code,
                chart_of_accounts_name      : row.accounts_type_name,
                chart_of_accounts_status    : row.accounts_type_status,
                accounts_category           : await get_accounts_category(row.accounts_type_id),
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: accounts_type_data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
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

// Chart of Accounts List Show
exports.chart_of_accounts_list_show = async (req, res) => {
    try {
        const coa_data = await chart_of_accounts_model.findAll({
            where:{
                chart_of_accounts_company: req.params.company,
                chart_of_accounts_status:1,
                chart_of_accounts_delete_status: 0,
            },
            order: [
                ['chart_of_accounts_name', 'ASC']
            ]
        });

        if(coa_data.length > 0) {
            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
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

// Get Chart of Accounts Control Group
exports.get_chart_of_accounts_control_group = async (req, res) => {
    try {
        const coa_data = await chart_of_accounts_model.findAll({
            where:{
                chart_of_accounts_company: req.params.company,
                chart_of_accounts_status:1,
                chart_of_accounts_delete_status: 0,
                chart_of_accounts_coa_status: 'control_group',
            },
            order: [
                ['chart_of_accounts_name', 'ASC']
            ]
        });

        if(coa_data.length > 0) {
            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
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

// Get Chart of Accounts General Ledger
exports.get_chart_of_accounts_general_ledger = async (req, res) => {
    try {
        const coa_data = await chart_of_accounts_model.findAll({
            where:{
                chart_of_accounts_company: req.params.company,
                chart_of_accounts_status:1,
                chart_of_accounts_delete_status: 0,
                chart_of_accounts_coa_status: 'general_ledger',
            },
            order: [
                ['chart_of_accounts_name', 'ASC']
            ]
        });

        if(coa_data.length > 0) {
            const data = await Promise.all(coa_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
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

// Chart of Accounts Type
exports.get_chart_of_accounts_type = async (req, res) => {
    try {
        const data = await chart_of_accounts_model.findAll({
            where: {
                chart_of_accounts_id: req.params.type,
                chart_of_accounts_delete_status:0,
                chart_of_accounts_status:1
            },
        });

        if(data.length > 0) {
            const coa_data = await Promise.all(data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: coa_data
            });
        } else {
            const data = await accounts_type_model.findAll({
                where: {
                    accounts_type_id: req.params.type,
                    accounts_type_delete_status:0,
                    accounts_type_status:1
                },
            });
            const coa_data = await Promise.all(data.map(async (row) => ({
                chart_of_accounts_id                : row.accounts_type_id ,
                chart_of_accounts_code              : row.accounts_type_code,
                chart_of_accounts_name              : row.accounts_type_name,
                chart_of_accounts_status            : row.accounts_type_status
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: coa_data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
            data: [],
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

// Get Chart of Accounts Category
exports.get_chart_of_accounts_category = async (req, res) => {
    try {
        const data = await chart_of_accounts_model.findAll({
            where: {
                chart_of_accounts_accounts_category: req.params.category,
                chart_of_accounts_delete_status:0,
                chart_of_accounts_status:1
            },
        });

        if(data.length > 0) {
            const coa_data = await Promise.all(data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_accounts_id ,
                chart_of_accounts_code              : row.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_accounts_name,
                chart_of_accounts_company           : row.chart_of_accounts_company,
                chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : row.chart_of_accounts_coa_status,
                chart_of_accounts_link              : row.chart_of_accounts_link || '',
                chart_of_accounts_status            : row.chart_of_accounts_status,
                chart_of_accounts_posting_status    : row.chart_of_accounts_posting_status
            })));

            return res.send({
                status: "1",
                message: "Chart of Accounts Find Successfully!",
                data: coa_data
            });
        }

        return res.send({
            status: "0",
            message: "Chart of Accounts Not Found !",
            data: [],
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

// Get Chart of Accounts
exports.get_chart_of_accounts = async (req, res) => {
    try {
        const data = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_id: req.params.chart_of_accounts_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Chart of Accounts Not Found !",
                data: "",
            });
        }

        return res.send({
            status: "1",
            message: "Chart of Accounts Find Successfully!",
            data: {
                chart_of_accounts_id                : data.chart_of_accounts_id ,
                chart_of_accounts_code              : data.chart_of_accounts_code,
                chart_of_accounts_name              : data.chart_of_accounts_name,
                chart_of_accounts_company           : data.chart_of_accounts_company,
                chart_of_accounts_accounts_category : data.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : data.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : data.chart_of_accounts_coa_status,
                chart_of_accounts_link              : data.chart_of_accounts_link || '',
                chart_of_accounts_status            : data.chart_of_accounts_status,
                chart_of_accounts_posting_status    : data.chart_of_accounts_posting_status,
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

// Chart of Accounts Create
exports.chart_of_accounts_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const check_coa_code = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company   : req.body.chart_of_accounts_company,
                chart_of_accounts_code      : req.body.chart_of_accounts_code
            },
        });

        if(check_coa_code) {
            return res.send({
                status: "0",
                message: "Chart of Accounts Code Duplicate!",
                data: "",
            });
        }

        const at_data = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_id: req.body.chart_of_accounts_accounts_category
            },
        });

        console.log('chart_of_accounts_accounts_category_data', req.body.chart_of_accounts_accounts_category)

        if(at_data){
            const chart_of_accounts = await chart_of_accounts_model.create({
                chart_of_accounts_company           : req.body.chart_of_accounts_company,
                chart_of_accounts_code              : req.body.chart_of_accounts_code,
                chart_of_accounts_name              : req.body.chart_of_accounts_name,
                chart_of_accounts_accounts_category : req.body.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : at_data.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : req.body.chart_of_accounts_coa_status,
                chart_of_accounts_posting_status    : 0,
                chart_of_accounts_status            : 1,
                // chart_of_accounts_status            : req.body.chart_of_accounts_status,
                chart_of_accounts_create_by         : user_id,
            });
            if(chart_of_accounts) {
                const data = await chart_of_accounts_model.findOne({
                    where: {
                        chart_of_accounts_id: chart_of_accounts.chart_of_accounts_id
                    },
                });

                return res.send({
                    status: "1",
                    message: "Chart of Accounts Create Successfully!",
                    data: {
                        chart_of_accounts_id                : data.chart_of_accounts_id ,
                        chart_of_accounts_code              : data.chart_of_accounts_code,
                        chart_of_accounts_name              : data.chart_of_accounts_name,
                        chart_of_accounts_company           : data.chart_of_accounts_company,
                        chart_of_accounts_accounts_category : data.chart_of_accounts_accounts_category,
                        chart_of_accounts_accounts_type     : data.chart_of_accounts_accounts_type,
                        chart_of_accounts_coa_status        : data.chart_of_accounts_coa_status,
                        chart_of_accounts_link              : data.chart_of_accounts_link || '',
                        chart_of_accounts_status            : data.chart_of_accounts_status,
                        chart_of_accounts_posting_status    : data.chart_of_accounts_posting_status,
                    }
                });
            }
        }

        return res.send({
            status: "0",
            message: "Accounts Category Not Found !",
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

// Chart of Accounts Update
exports.chart_of_accounts_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const check_coa_code = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_id        : {[Op.not]:req.params.chart_of_accounts_id},
                chart_of_accounts_company   : req.body.chart_of_accounts_company,
                chart_of_accounts_code      : req.body.chart_of_accounts_code
            },
        });

        if(check_coa_code) {
            return res.send({
                status: "0",
                message: "Chart of Accounts Code Duplicate!",
                data: "",
            });
        }

        const chart_of_accounts_data = await chart_of_accounts_model.findOne({
            where:{
                chart_of_accounts_id: req.params.chart_of_accounts_id
            }
        });

        if(!chart_of_accounts_data) {
            return res.send({
                status: "0",
                message: "Chart of Accounts ID Not Found!",
                data: "",
            });
        }

        const at_data = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_id: req.body.chart_of_accounts_accounts_category
            },
        });

        if(at_data){
            const chart_of_accounts = await chart_of_accounts_model.update({
                chart_of_accounts_company           : req.body.chart_of_accounts_company,
                chart_of_accounts_code              : req.body.chart_of_accounts_code,
                chart_of_accounts_name              : req.body.chart_of_accounts_name,
                chart_of_accounts_accounts_category : req.body.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : at_data.chart_of_accounts_accounts_type,
                chart_of_accounts_coa_status        : req.body.chart_of_accounts_coa_status,
                chart_of_accounts_status            : req.body.chart_of_accounts_status,
                chart_of_accounts_update_by         : user_id,
            },
            {
                where:{
                    chart_of_accounts_id: req.params.chart_of_accounts_id
                }
            });
            if(chart_of_accounts) {
                const data = await chart_of_accounts_model.findOne({
                    where: {
                        chart_of_accounts_id: req.params.chart_of_accounts_id
                    },
                });

                return res.send({
                    status: "1",
                    message: "Chart of Accounts Update Successfully!",
                    data: {
                        chart_of_accounts_id                : data.chart_of_accounts_id ,
                        chart_of_accounts_code              : data.chart_of_accounts_code,
                        chart_of_accounts_name              : data.chart_of_accounts_name,
                        chart_of_accounts_company           : data.chart_of_accounts_company,
                        chart_of_accounts_accounts_category : data.chart_of_accounts_accounts_category,
                        chart_of_accounts_accounts_type     : data.chart_of_accounts_accounts_type,
                        chart_of_accounts_coa_status        : data.chart_of_accounts_coa_status,
                        chart_of_accounts_link              : data.chart_of_accounts_link || '',
                        chart_of_accounts_status            : data.chart_of_accounts_status,
                        chart_of_accounts_posting_status    : data.chart_of_accounts_posting_status
                    }
                });
            }
        }
        return res.send({
            status: "1",
            message: "Accounts Type Not Found!",
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

// Chart of Accounts Delete
exports.chart_of_accounts_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const chart_of_accounts_data = await chart_of_accounts_model.findOne({
            where:{
                chart_of_accounts_id: req.params.chart_of_accounts_id
            }
        });

        if(!chart_of_accounts_data) {
            return res.send({
                status: "0",
                message: "Chart of Accounts ID Not Found!",
                data: "",
            });
        }

        const chart_of_accounts = await chart_of_accounts_model.update({
            chart_of_accounts_status        : 0,
            chart_of_accounts_delete_status : 1,
            chart_of_accounts_delete_by     : user_id,
            chart_of_accounts_delete_at     : new Date(),
        },
        {
            where:{
                chart_of_accounts_id: req.params.chart_of_accounts_id
            }
        });

        return res.send({
            status: "1",
            message: "Chart of Accounts Delete Successfully!",
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