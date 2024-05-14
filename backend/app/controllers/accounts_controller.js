require("dotenv").config();
const jwt                           = require("jsonwebtoken");
const config                        = require("../config/config.js");
const db                            = require("../models/index.js");
const accounts_type_model           = db.accounts_type_model;
const chart_of_accounts_model       = db.chart_of_accounts_model;
const accounts_model                = db.accounts_model;
const accounts_details_model        = db.accounts_details_model;
const voucher_type_model            = db.voucher_type_model;
const financial_year_model          = db.financial_year_model;
const company_model                 = db.company_model;
const branch_model                  = db.branch_model;

const sequelize                     = db.sequelize;
const Op                            = db.Sequelize.Op;
let user_id;

// Voucher List
exports.voucher_list = async (req, res) => {
    try {
        let company         = req.query.company;
        let branch          = req.query.branch;
        let from_date       = req.query.from_date;
        let to_date         = req.query.to_date;
        let voucher_number  = req.query.voucher_number;
        let voucher_type    = req.query.voucher_type;
        let voucher_status  = req.query.status;

        const voucher_information = await accounts_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: accounts_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "accounts_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: accounts_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "accounts_branch",
                        required:false
                    }),
                },
                {
                    model: voucher_type_model,
                    attributes: ['voucher_type_code', 'voucher_type_name'],
                    association: accounts_model.hasOne(voucher_type_model, {
                        foreignKey : 'voucher_type_id',
                        sourceKey : "accounts_voucher_type",
                        required:false
                    }),
                },
                {
                    model: accounts_details_model,
                    attributes: ['accounts_details_id','accounts_details_accounts', 'accounts_details_accounts_type', 'accounts_details_accounts_category', 'accounts_details_control_group', 'accounts_details_general_ledger', 'accounts_details_subsidiary_ledger', 'accounts_details_debit', 'accounts_details_credit'],
                    association: accounts_model.hasMany(accounts_details_model, {
                        foreignKey : "accounts_details_accounts",
                        sourceKey : 'accounts_id',
                        required:false
                    }),
                    where: {
                        accounts_details_status: 1,
                        accounts_details_delete_status: 0
                    }
                }
            ],
            where   : {
                accounts_delete_status: 0,
                accounts_company: company,
                accounts_branch: branch,
                accounts_posting_date: {
                    [Op.between]: [from_date, to_date],
                },
                ...(voucher_number.length > 0?{
                    [Op.or]: [
                    {
                        accounts_voucher_number: {[Op.like]: `%${voucher_number}%`}
                    }
                ]
                }:{}),
                ...(voucher_type == 'all' ?{}:{
                    accounts_voucher_type: voucher_type
                }),
                ...(voucher_status == 'all' ?{}:{
                    accounts_status: voucher_status
                })
            },
            order   : [
                ['accounts_posting_date', 'ASC'],
                ['accounts_id', 'ASC']
            ]
        });

        if(voucher_information.length > 0) {
            const getAccountsAtData = async(type, data) => {
                const get_data = await accounts_type_model.findOne({ where:{ accounts_type_id : data } });
                if(type == 'code') {
                    return get_data.accounts_type_code;
                } else {
                    return get_data.accounts_type_name;
                }
            };

            const getAccountsCatData = async(type, data) => {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                if(type == 'code') {
                    return get_data.chart_of_accounts_code;
                } else {
                    return get_data.chart_of_accounts_name;
                }
            };
            const voucher_list = await Promise.all(voucher_information.map(async (row) => ({
                accounts_id                 : row.accounts_id,
                accounts_posting_date       : row.accounts_posting_date,
                accounts_posting_month      : row.accounts_posting_month,
                accounts_posting_year       : row.accounts_posting_year,
                accounts_company            : row.accounts_company,
                accounts_company_name       : row.company.company_name,
                accounts_branch             : row.accounts_branch,
                accounts_branch_code        : row.branch.branch_code,
                accounts_branch_name        : row.branch.branch_name,
                accounts_voucher_type       : row.accounts_voucher_type,
                accounts_voucher_type_name  : row.voucher_type.voucher_type_name,
                accounts_voucher_number     : row.accounts_voucher_number,
                accounts_narration          : row.accounts_narration,
                accounts_total_debit        : row.accounts_total_debit,
                accounts_total_credit       : row.accounts_total_credit,
                accounts_status             : row.accounts_status,
                accounts_details            : await Promise.all(row.accounts_details.map(async (row_data) => ({
                    accounts_details_id                     : row_data.accounts_details_id,
                    accounts_details_accounts               : row_data.accounts_details_accounts,
                    accounts_details_accounts_type          : row_data.accounts_details_accounts_type,
                    accounts_details_accounts_type_code     : await getAccountsAtData('code', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_type_name     : await getAccountsAtData('name', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_category      : row_data.accounts_details_accounts_category,
                    accounts_details_accounts_category_code : await getAccountsCatData('code', row_data.accounts_details_accounts_category),
                    accounts_details_accounts_category_name : await getAccountsCatData('name', row_data.accounts_details_accounts_category),
                    accounts_details_control_group          : row_data.accounts_details_control_group,
                    accounts_details_control_group_code     : await getAccountsCatData('code', row_data.accounts_details_control_group),
                    accounts_details_control_group_name     : await getAccountsCatData('name', row_data.accounts_details_control_group),
                    accounts_details_general_ledger         : row_data.accounts_details_general_ledger,
                    accounts_details_general_ledger_code    : await getAccountsCatData('code', row_data.accounts_details_general_ledger),
                    accounts_details_general_ledger_name    : await getAccountsCatData('name', row_data.accounts_details_general_ledger),
                    accounts_details_subsidiary_ledger      : row_data.accounts_details_subsidiary_ledger,
                    accounts_details_subsidiary_ledger_code : await getAccountsCatData('code', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_subsidiary_ledger_name : await getAccountsCatData('name', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_debit                  : row_data.accounts_details_debit,
                    accounts_details_credit                 : row_data.accounts_details_credit,
                }))) || []
            })));

            return res.send({
                status: "1",
                message: "Voucher Information Find Successfully!",
                data: voucher_list
            });
        }

        return res.send({
            status: "0",
            message: "Voucher Information Find Error !",
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

// Voucher Search
exports.voucher_search = async (req, res) => {
    try {
        let company         = req.query.company;
        let branch          = req.query.branch;
        let voucher_number  = req.query.voucher_number;

        const voucher_information = await accounts_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: accounts_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "accounts_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: accounts_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "accounts_branch",
                        required:false
                    }),
                },
                {
                    model: voucher_type_model,
                    attributes: ['voucher_type_code', 'voucher_type_name'],
                    association: accounts_model.hasOne(voucher_type_model, {
                        foreignKey : 'voucher_type_id',
                        sourceKey : "accounts_voucher_type",
                        required:false
                    }),
                },
                {
                    model: accounts_details_model,
                    attributes: ['accounts_details_id','accounts_details_accounts', 'accounts_details_accounts_type', 'accounts_details_accounts_category', 'accounts_details_control_group', 'accounts_details_general_ledger', 'accounts_details_subsidiary_ledger', 'accounts_details_debit', 'accounts_details_credit'],
                    association: accounts_model.hasMany(accounts_details_model, {
                        foreignKey : "accounts_details_accounts",
                        sourceKey : 'accounts_id',
                        required:false
                    }),
                    where: {
                        accounts_details_status: 1,
                        accounts_details_delete_status: 0
                    }
                }
            ],
            where   : {
                accounts_status: 1,
                accounts_delete_status: 0,
                accounts_company: company,
                accounts_branch: branch,
                // accounts_voucher_number: voucher_number,
                accounts_voucher_number: {[Op.like]: `%${voucher_number}%`}
            },
            limit: 50,
            order   : [
                ['accounts_posting_date', 'ASC'],
                ['accounts_id', 'ASC']
            ]
        });

        if(voucher_information.length > 0) {
            const getAccountsAtData = async(type, data) => {
                const get_data = await accounts_type_model.findOne({ where:{ accounts_type_id : data } });
                if(type == 'code') {
                    return get_data.accounts_type_code;
                } else {
                    return get_data.accounts_type_name;
                }
            };

            const getAccountsCatData = async(type, data) => {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                if(type == 'code') {
                    return get_data.chart_of_accounts_code;
                } else {
                    return get_data.chart_of_accounts_name;
                }
            };
            const voucher_list = await Promise.all(voucher_information.map(async (row) => ({
                accounts_id                 : row.accounts_id,
                accounts_posting_date       : row.accounts_posting_date,
                accounts_posting_month      : row.accounts_posting_month,
                accounts_posting_year       : row.accounts_posting_year,
                accounts_company            : row.accounts_company,
                accounts_company_name       : row.company.company_name,
                accounts_branch             : row.accounts_branch,
                accounts_branch_code        : row.branch.branch_code,
                accounts_branch_name        : row.branch.branch_name,
                accounts_voucher_type       : row.accounts_voucher_type,
                accounts_voucher_type_name  : row.voucher_type.voucher_type_name,
                accounts_voucher_number     : row.accounts_voucher_number,
                accounts_narration          : row.accounts_narration,
                accounts_total_debit        : row.accounts_total_debit,
                accounts_total_credit       : row.accounts_total_credit,
                accounts_status             : row.accounts_status,
                accounts_details            : await Promise.all(row.accounts_details.map(async (row_data) => ({
                    accounts_details_id                     : row_data.accounts_details_id,
                    accounts_details_accounts               : row_data.accounts_details_accounts,
                    accounts_details_accounts_type          : row_data.accounts_details_accounts_type,
                    accounts_details_accounts_type_code     : await getAccountsAtData('code', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_type_name     : await getAccountsAtData('name', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_category      : row_data.accounts_details_accounts_category,
                    accounts_details_accounts_category_code : await getAccountsCatData('code', row_data.accounts_details_accounts_category),
                    accounts_details_accounts_category_name : await getAccountsCatData('name', row_data.accounts_details_accounts_category),
                    accounts_details_control_group          : row_data.accounts_details_control_group,
                    accounts_details_control_group_code     : await getAccountsCatData('code', row_data.accounts_details_control_group),
                    accounts_details_control_group_name     : await getAccountsCatData('name', row_data.accounts_details_control_group),
                    accounts_details_general_ledger         : row_data.accounts_details_general_ledger,
                    accounts_details_general_ledger_code    : await getAccountsCatData('code', row_data.accounts_details_general_ledger),
                    accounts_details_general_ledger_name    : await getAccountsCatData('name', row_data.accounts_details_general_ledger),
                    accounts_details_subsidiary_ledger      : row_data.accounts_details_subsidiary_ledger,
                    accounts_details_subsidiary_ledger_code : await getAccountsCatData('code', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_subsidiary_ledger_name : await getAccountsCatData('name', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_debit                  : row_data.accounts_details_debit,
                    accounts_details_credit                 : row_data.accounts_details_credit,
                }))) || []
            })));

            return res.send({
                status: "1",
                message: "Voucher Information Find Successfully!",
                data: voucher_list
            });
        }

        return res.send({
            status: "0",
            message: "Voucher Not Found !",
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

// Voucher List Active
exports.voucher_list_active = async (req, res) => {
    try {
        let company         = req.query.company;
        let branch          = req.query.branch;
        let from_date       = req.query.from_date;
        let to_date         = req.query.to_date;
        let voucher_type    = req.query.voucher_type;

        const voucher_information = await accounts_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: accounts_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "accounts_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: accounts_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "accounts_branch",
                        required:false
                    }),
                },
                {
                    model: voucher_type_model,
                    attributes: ['voucher_type_code', 'voucher_type_name'],
                    association: accounts_model.hasOne(voucher_type_model, {
                        foreignKey : 'voucher_type_id',
                        sourceKey : "accounts_voucher_type",
                        required:false
                    }),
                },
                {
                    model: accounts_details_model,
                    attributes: ['accounts_details_id','accounts_details_accounts', 'accounts_details_accounts_type', 'accounts_details_accounts_category', 'accounts_details_control_group', 'accounts_details_general_ledger', 'accounts_details_subsidiary_ledger', 'accounts_details_debit', 'accounts_details_credit'],
                    association: accounts_model.hasMany(accounts_details_model, {
                        foreignKey : "accounts_details_accounts",
                        sourceKey : 'accounts_id',
                        required:false
                    }),
                    where: {
                        accounts_details_status: 1,
                        accounts_details_delete_status: 0
                    }
                }
            ],
            where   : {
                accounts_company: company,
                accounts_branch: branch,
                accounts_status: 1,
                accounts_delete_status: 0,
                accounts_posting_date: {
                    [Op.between]: [from_date, to_date],
                },
                ...(voucher_type == 'all' ?{}:{
                    accounts_voucher_type: voucher_type
                })
            },
            order   : [
                ['accounts_posting_date', 'ASC'],
                ['accounts_id', 'ASC']
            ]
        });

        if(voucher_information.length > 0) {
            const getAccountsAtData = async(type, data) => {
                const get_data = await accounts_type_model.findOne({ where:{ accounts_type_id : data } });
                if(type == 'code') {
                    return get_data.accounts_type_code;
                } else {
                    return get_data.accounts_type_name;
                }
            };

            const getAccountsCatData = async(type, data) => {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                if(type == 'code') {
                    return get_data.chart_of_accounts_code;
                } else {
                    return get_data.chart_of_accounts_name;
                }
            };
            const voucher_list = await Promise.all(voucher_information.map(async (row) => ({
                accounts_id                 : row.accounts_id,
                accounts_posting_date       : row.accounts_posting_date,
                accounts_posting_month      : row.accounts_posting_month,
                accounts_posting_year       : row.accounts_posting_year,
                accounts_company            : row.accounts_company,
                accounts_company_name       : row.company.company_name,
                accounts_branch             : row.accounts_branch,
                accounts_branch_code        : row.branch.branch_code,
                accounts_branch_name        : row.branch.branch_name,
                accounts_voucher_type       : row.accounts_voucher_type,
                accounts_voucher_type_name  : row.voucher_type.voucher_type_name,
                accounts_voucher_number     : row.accounts_voucher_number,
                accounts_narration          : row.accounts_narration,
                accounts_total_debit        : row.accounts_total_debit,
                accounts_total_credit       : row.accounts_total_credit,
                accounts_status             : row.accounts_status,
                accounts_details            : await Promise.all(row.accounts_details.map(async (row_data) => ({
                    accounts_details_id                     : row_data.accounts_details_id,
                    accounts_details_accounts               : row_data.accounts_details_accounts,
                    accounts_details_accounts_type          : row_data.accounts_details_accounts_type,
                    accounts_details_accounts_type_code     : await getAccountsAtData('code', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_type_name     : await getAccountsAtData('name', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_category      : row_data.accounts_details_accounts_category,
                    accounts_details_accounts_category_code : await getAccountsCatData('code', row_data.accounts_details_accounts_category),
                    accounts_details_accounts_category_name : await getAccountsCatData('name', row_data.accounts_details_accounts_category),
                    accounts_details_control_group          : row_data.accounts_details_control_group,
                    accounts_details_control_group_code     : await getAccountsCatData('code', row_data.accounts_details_control_group),
                    accounts_details_control_group_name     : await getAccountsCatData('name', row_data.accounts_details_control_group),
                    accounts_details_general_ledger         : row_data.accounts_details_general_ledger,
                    accounts_details_general_ledger_code    : await getAccountsCatData('code', row_data.accounts_details_general_ledger),
                    accounts_details_general_ledger_name    : await getAccountsCatData('name', row_data.accounts_details_general_ledger),
                    accounts_details_subsidiary_ledger      : row_data.accounts_details_subsidiary_ledger,
                    accounts_details_subsidiary_ledger_code : await getAccountsCatData('code', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_subsidiary_ledger_name : await getAccountsCatData('name', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_debit                  : row_data.accounts_details_debit,
                    accounts_details_credit                 : row_data.accounts_details_credit,
                }))) || []
            })));

            return res.send({
                status: "1",
                message: "Voucher Information Find Successfully!",
                data: voucher_list
            });
        }

        return res.send({
            status: "0",
            message: "Voucher Information Not Found !",
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

// Voucher List Latest
exports.voucher_list_latest = async (req, res) => {
    try {

        const company =req.query.company;
        const branch =req.query.branch;

        const voucher_information = await accounts_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: accounts_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "accounts_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: accounts_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "accounts_branch",
                        required:false
                    }),
                },
                {
                    model: voucher_type_model,
                    attributes: ['voucher_type_code', 'voucher_type_name'],
                    association: accounts_model.hasOne(voucher_type_model, {
                        foreignKey : 'voucher_type_id',
                        sourceKey : "accounts_voucher_type",
                        required:false
                    }),
                },
                {
                    model: accounts_details_model,
                    attributes: ['accounts_details_id','accounts_details_accounts', 'accounts_details_accounts_type', 'accounts_details_accounts_category', 'accounts_details_control_group', 'accounts_details_general_ledger', 'accounts_details_subsidiary_ledger', 'accounts_details_debit', 'accounts_details_credit'],
                    association: accounts_model.hasMany(accounts_details_model, {
                        foreignKey : "accounts_details_accounts",
                        sourceKey : 'accounts_id',
                        required:false
                    }),
                    where: {
                        accounts_details_status: 1,
                        accounts_details_delete_status: 0
                    }
                }
            ],
            where   : {
                accounts_company: company,
                accounts_branch: branch,
                accounts_status: 1,
                accounts_delete_status: 0,
            },
            limit: 10,
            order   : [
                ['accounts_posting_date', 'DESC']
            ]
        });

        if(voucher_information.length > 0) {
            const getAccountsAtData = async(type, data) => {
                const get_data = await accounts_type_model.findOne({ where:{ accounts_type_id : data } });
                if(type == 'code') {
                    return get_data.accounts_type_code;
                } else {
                    return get_data.accounts_type_name;
                }
            };

            const getAccountsCatData = async(type, data) => {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                if(type == 'code') {
                    return get_data.chart_of_accounts_code;
                } else {
                    return get_data.chart_of_accounts_name;
                }
            };
            const voucher_list = await Promise.all(voucher_information.map(async (row) => ({
                accounts_id                 : row.accounts_id,
                accounts_posting_date       : row.accounts_posting_date,
                accounts_posting_month      : row.accounts_posting_month,
                accounts_posting_year       : row.accounts_posting_year,
                accounts_company            : row.accounts_company,
                accounts_company_name       : row.company.company_name,
                accounts_branch             : row.accounts_branch,
                accounts_branch_code        : row.branch.branch_code,
                accounts_branch_name        : row.branch.branch_name,
                accounts_voucher_type       : row.accounts_voucher_type,
                accounts_voucher_type_name  : row.voucher_type.voucher_type_name,
                accounts_voucher_number     : row.accounts_voucher_number,
                accounts_narration          : row.accounts_narration,
                accounts_total_debit        : row.accounts_total_debit,
                accounts_total_credit       : row.accounts_total_credit,
                accounts_status             : row.accounts_status,
                accounts_details            : await Promise.all(row.accounts_details.map(async (row_data) => ({
                    accounts_details_id                     : row_data.accounts_details_id,
                    accounts_details_accounts               : row_data.accounts_details_accounts,
                    accounts_details_accounts_type          : row_data.accounts_details_accounts_type,
                    accounts_details_accounts_type_code     : await getAccountsAtData('code', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_type_name     : await getAccountsAtData('name', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_category      : row_data.accounts_details_accounts_category,
                    accounts_details_accounts_category_code : await getAccountsCatData('code', row_data.accounts_details_accounts_category),
                    accounts_details_accounts_category_name : await getAccountsCatData('name', row_data.accounts_details_accounts_category),
                    accounts_details_control_group          : row_data.accounts_details_control_group,
                    accounts_details_control_group_code     : await getAccountsCatData('code', row_data.accounts_details_control_group),
                    accounts_details_control_group_name     : await getAccountsCatData('name', row_data.accounts_details_control_group),
                    accounts_details_general_ledger         : row_data.accounts_details_general_ledger,
                    accounts_details_general_ledger_code    : await getAccountsCatData('code', row_data.accounts_details_general_ledger),
                    accounts_details_general_ledger_name    : await getAccountsCatData('name', row_data.accounts_details_general_ledger),
                    accounts_details_subsidiary_ledger      : row_data.accounts_details_subsidiary_ledger,
                    accounts_details_subsidiary_ledger_code : await getAccountsCatData('code', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_subsidiary_ledger_name : await getAccountsCatData('name', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_debit                  : row_data.accounts_details_debit,
                    accounts_details_credit                 : row_data.accounts_details_credit,
                }))) || []
            })));

            return res.send({
                status: "1",
                message: "Voucher Information Find Successfully!",
                data: voucher_list
            });
        }

        return res.send({
            status: "0",
            message: "Voucher Information Find Error !",
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

// Get Voucher
exports.get_voucher = async (req, res) => {
    try {
        const data = await accounts_model.findOne({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: accounts_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "accounts_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: accounts_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "accounts_branch",
                        required:false
                    }),
                },
                {
                    model: voucher_type_model,
                    attributes: ['voucher_type_code', 'voucher_type_name'],
                    association: accounts_model.hasOne(voucher_type_model, {
                        foreignKey : 'voucher_type_id',
                        sourceKey : "accounts_voucher_type",
                        required:false
                    }),
                },
                {
                    model: accounts_details_model,
                    attributes: ['accounts_details_id','accounts_details_accounts', 'accounts_details_accounts_type', 'accounts_details_accounts_category', 'accounts_details_control_group', 'accounts_details_general_ledger', 'accounts_details_subsidiary_ledger', 'accounts_details_debit', 'accounts_details_credit'],
                    association: accounts_model.hasMany(accounts_details_model, {
                        foreignKey : "accounts_details_accounts",
                        sourceKey : 'accounts_id',
                        required:false
                    }),
                    where: {
                        accounts_details_status: 1,
                        accounts_details_delete_status: 0
                    },
                    order: [
                        ['accounts_details_id', 'ASC']
                    ],
                }
            ],
            where   : {
                accounts_id: req.params.accounts_id
            },
            order   : [
                ['accounts_posting_date', 'ASC']
            ]
        });

        if(data) {
            const getAccountsAtData = async(type, data) => {
                const get_data = await accounts_type_model.findOne({ where:{ accounts_type_id : data } });
                if(type == 'code') {
                    return get_data.accounts_type_code;
                } else {
                    return get_data.accounts_type_name;
                }
            };

            const getAccountsCatData = async(type, data) => {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                if(type == 'code') {
                    return get_data.chart_of_accounts_code;
                } else {
                    return get_data.chart_of_accounts_name;
                }
            };

            const voucher_list = {
                accounts_id                 : data.accounts_id,
                accounts_posting_date       : data.accounts_posting_date,
                accounts_posting_month      : data.accounts_posting_month,
                accounts_posting_year       : data.accounts_posting_year,
                accounts_company            : data.accounts_company,
                accounts_company_name       : data.company.company_name,
                accounts_branch             : data.accounts_branch,
                accounts_branch_code        : data.branch.branch_code,
                accounts_branch_name        : data.branch.branch_name,
                accounts_voucher_type       : data.accounts_voucher_type,
                accounts_voucher_type_name  : data.voucher_type.voucher_type_name,
                accounts_voucher_number     : data.accounts_voucher_number,
                accounts_narration          : data.accounts_narration,
                accounts_total_debit        : data.accounts_total_debit,
                accounts_total_credit       : data.accounts_total_credit,
                accounts_status             : data.accounts_status,
                accounts_details            : await Promise.all(data.accounts_details.map(async (row_data) => ({
                    accounts_details_id                     : row_data.accounts_details_id,
                    accounts_details_accounts               : row_data.accounts_details_accounts,
                    accounts_details_accounts_type          : row_data.accounts_details_accounts_type,
                    accounts_details_accounts_type_code     : await getAccountsAtData('code', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_type_name     : await getAccountsAtData('name', row_data.accounts_details_accounts_type),
                    accounts_details_accounts_category      : row_data.accounts_details_accounts_category,
                    accounts_details_accounts_category_code : await getAccountsCatData('code', row_data.accounts_details_accounts_category),
                    accounts_details_accounts_category_name : await getAccountsCatData('name', row_data.accounts_details_accounts_category),
                    accounts_details_control_group          : row_data.accounts_details_control_group,
                    accounts_details_control_group_code     : await getAccountsCatData('code', row_data.accounts_details_control_group),
                    accounts_details_control_group_name     : await getAccountsCatData('name', row_data.accounts_details_control_group),
                    accounts_details_general_ledger         : row_data.accounts_details_general_ledger,
                    accounts_details_general_ledger_code    : await getAccountsCatData('code', row_data.accounts_details_general_ledger),
                    accounts_details_general_ledger_name    : await getAccountsCatData('name', row_data.accounts_details_general_ledger),
                    accounts_details_subsidiary_ledger      : row_data.accounts_details_subsidiary_ledger,
                    accounts_details_subsidiary_ledger_code : await getAccountsCatData('code', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_subsidiary_ledger_name : await getAccountsCatData('name', row_data.accounts_details_subsidiary_ledger),
                    accounts_details_debit                  : row_data.accounts_details_debit,
                    accounts_details_credit                 : row_data.accounts_details_credit,
                }))) || []
            };

            return res.send({
                status: "1",
                message: "Voucher Information Find Successfully!",
                data: voucher_list
            });
        }

        return res.send({
            status: "0",
            message: "Voucher Information Find Error !",
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

// Voucher Create
exports.voucher_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const getVoucherType = async(type, data) => {
            const get_data = await voucher_type_model.findOne({ where:{ voucher_type_id: data } });
            if(type == 'code') {
                return get_data.voucher_type_code;
            } else if(type == 'name') {
                return get_data.voucher_type_name;
            }
        };

        const getAccountsCatData = async(type, data) => {
            if(type == 'at') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_type;
            } else if(type == 'ac') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_category;
            } else if(type == 'cg') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_category;
            } else if(type == 'gl') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_category;
            }
        };

        const accounts_list     = req.body.accounts_list;
        const accounts_data     = req.body.accountsFormData;


        const posting_date      = accounts_data.accounts_posting_date;
        const voucher_type      = accounts_data.accounts_voucher_type;
        const voucher_type_code = await getVoucherType('code', voucher_type);

        const voucher_count = await accounts_model.count({where:{accounts_voucher_type:voucher_type}})+1;
        const voucher_number = voucher_type_code+"-"+voucher_count.toString().padStart(7, '0');

        if(accounts_data.accounts_total_debit == accounts_data.accounts_total_credit) {
            const accountsData = await accounts_model.create({
                accounts_company        : accounts_data.accounts_company,
                accounts_branch         : accounts_data.accounts_branch,
                accounts_posting_date   : posting_date,
                accounts_posting_month  : new Date(posting_date).toLocaleString('default',{month:'long'})+"-"+new Date(posting_date).getFullYear(),
                accounts_posting_year   : new Date(posting_date).getFullYear(),
                accounts_voucher_type   : voucher_type,
                accounts_voucher_number : voucher_number,
                accounts_narration      : accounts_data.accounts_narration,
                accounts_total_debit    : accounts_data.accounts_total_debit,
                accounts_total_credit   : accounts_data.accounts_total_credit,
                accounts_status         : 1,
                accounts_create_by      : user_id,
            });
            if(accountsData) {
                const accounts_details_data = await Promise.all(accounts_list.map(async (item) => ({
                    accounts_details_company                : accounts_data.accounts_company,
                    accounts_details_branch                 : accounts_data.accounts_branch,
                    accounts_details_accounts               : accountsData.accounts_id,
                    accounts_details_posting_date           : posting_date,
                    accounts_details_posting_month          : new Date(posting_date).toLocaleString('default',{month:'long'})+"-"+new Date(posting_date).getFullYear(),
                    accounts_details_posting_year           : new Date(posting_date).getFullYear(),
                    accounts_details_voucher_type           : voucher_type,
                    accounts_details_voucher_number         : voucher_number,
                    accounts_details_narration              : accounts_data.accounts_narration,
                    accounts_details_accounts_type          : await getAccountsCatData('at', item.coa_id),
                    accounts_details_accounts_category      : await getAccountsCatData('ac', await getAccountsCatData('cg', await getAccountsCatData('gl', item.coa_id))),
                    accounts_details_control_group          : await getAccountsCatData('cg', await getAccountsCatData('gl', item.coa_id)),
                    accounts_details_general_ledger         : await getAccountsCatData('gl', item.coa_id),
                    accounts_details_subsidiary_ledger      : item.coa_id,
                    accounts_details_debit                  : item.debit,
                    accounts_details_credit                 : item.credit,
                    accounts_details_status                 : 1,
                    accounts_details_create_by              : user_id,
                })));

                const accountsDetailsData = await accounts_details_model.bulkCreate(accounts_details_data);
                const data = await accounts_model.findOne({
                    include : [
                        {
                            model: company_model,
                            attributes: ['company_name'],
                            association: accounts_model.hasOne(company_model, {
                                foreignKey : 'company_id',
                                sourceKey : "accounts_company",
                                required:false
                            }),
                        },
                        {
                            model: branch_model,
                            attributes: ['branch_code', 'branch_name'],
                            association: accounts_model.hasOne(branch_model, {
                                foreignKey : 'branch_id',
                                sourceKey : "accounts_branch",
                                required:false
                            }),
                        },
                        {
                            model: voucher_type_model,
                            attributes: ['voucher_type_code', 'voucher_type_name'],
                            association: accounts_model.hasOne(voucher_type_model, {
                                foreignKey : 'voucher_type_id',
                                sourceKey : "accounts_voucher_type",
                                required:false
                            }),
                        },
                        {
                            model: accounts_details_model,
                            attributes: ['accounts_details_id','accounts_details_accounts', 'accounts_details_accounts_type', 'accounts_details_accounts_category', 'accounts_details_control_group', 'accounts_details_general_ledger', 'accounts_details_subsidiary_ledger', 'accounts_details_debit', 'accounts_details_credit'],
                            association: accounts_model.hasMany(accounts_details_model, {
                                foreignKey : "accounts_details_accounts",
                                sourceKey : 'accounts_id',
                                required:false
                            }),
                            where: {
                                accounts_details_status: 1,
                                accounts_details_delete_status: 0
                            },
                            order: [
                                ['accounts_details_id', 'ASC']
                            ],
                        }
                    ],
                    where:{
                        accounts_id: accountsData.accounts_id
                    }
                });

                const getAccountsAtData = async(type, data) => {
                    const get_data = await accounts_type_model.findOne({ where:{ accounts_type_id : data } });
                    if(type == 'code') {
                        return get_data.accounts_type_code;
                    } else {
                        return get_data.accounts_type_name;
                    }
                };

                const getAccountsCatDataInfo = async(type, data) => {
                    const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                    if(type == 'code') {
                        return get_data.chart_of_accounts_code;
                    } else {
                        return get_data.chart_of_accounts_name;
                    }
                };

                return res.send({
                    status: "1",
                    message: "Voucher Posting Successfully!",
                    data: {
                        accounts_id                 : data.accounts_id,
                        accounts_posting_date       : data.accounts_posting_date,
                        accounts_posting_month      : data.accounts_posting_month,
                        accounts_posting_year       : data.accounts_posting_year,
                        accounts_company            : data.accounts_company,
                        accounts_company_name       : data.company.company_name,
                        accounts_branch             : data.accounts_branch,
                        accounts_branch_code        : data.branch.branch_code,
                        accounts_branch_name        : data.branch.branch_name,
                        accounts_voucher_type       : data.accounts_voucher_type,
                        accounts_voucher_type_name  : data.voucher_type.voucher_type_name,
                        accounts_voucher_number     : data.accounts_voucher_number,
                        accounts_narration          : data.accounts_narration,
                        accounts_total_debit        : data.accounts_total_debit,
                        accounts_total_credit       : data.accounts_total_credit,
                        accounts_status             : data.accounts_status,
                        accounts_details            : await Promise.all(data.accounts_details.map(async (row_data) => ({
                            accounts_details_id                     : row_data.accounts_details_id,
                            accounts_details_accounts               : row_data.accounts_details_accounts,
                            accounts_details_accounts_type          : row_data.accounts_details_accounts_type,
                            accounts_details_accounts_type_code     : await getAccountsAtData('code', row_data.accounts_details_accounts_type),
                            accounts_details_accounts_type_name     : await getAccountsAtData('name', row_data.accounts_details_accounts_type),
                            accounts_details_accounts_category      : row_data.accounts_details_accounts_category,
                            accounts_details_accounts_category_code : await getAccountsCatDataInfo('code', row_data.accounts_details_accounts_category),
                            accounts_details_accounts_category_name : await getAccountsCatDataInfo('name', row_data.accounts_details_accounts_category),
                            accounts_details_control_group          : row_data.accounts_details_control_group,
                            accounts_details_control_group_code     : await getAccountsCatDataInfo('code', row_data.accounts_details_control_group),
                            accounts_details_control_group_name     : await getAccountsCatDataInfo('name', row_data.accounts_details_control_group),
                            accounts_details_general_ledger         : row_data.accounts_details_general_ledger,
                            accounts_details_general_ledger_code    : await getAccountsCatDataInfo('code', row_data.accounts_details_general_ledger),
                            accounts_details_general_ledger_name    : await getAccountsCatDataInfo('name', row_data.accounts_details_general_ledger),
                            accounts_details_subsidiary_ledger      : row_data.accounts_details_subsidiary_ledger,
                            accounts_details_subsidiary_ledger_code : await getAccountsCatDataInfo('code', row_data.accounts_details_subsidiary_ledger),
                            accounts_details_subsidiary_ledger_name : await getAccountsCatDataInfo('name', row_data.accounts_details_subsidiary_ledger),
                            accounts_details_debit                  : row_data.accounts_details_debit,
                            accounts_details_credit                 : row_data.accounts_details_credit,
                        }))) || []
                    }
                });
            } else {
                return res.send({
                    status: "0",
                    message: "Voucher Posting Error !",
                    data: '',
                });
            }
        } else {
            return res.send({
                status: "0",
                message: "Debit & Credit Amount Does Not Match!",
                data: '',
            });
        }

    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: '',
        });
    }
};

// Voucher Update
exports.voucher_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const getVoucherType = async(type, data) => {
            const get_data = await voucher_type_model.findOne({ where:{ voucher_type_id: data } });
            if(type == 'code') {
                return get_data.voucher_type_code;
            } else if(type == 'name') {
                return get_data.voucher_type_name;
            }
        };

        const getAccountsCatData = async(type, data) => {
            if(type == 'at') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_type;
            } else if(type == 'ac') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_category;
            } else if(type == 'cg') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_category;
            } else if(type == 'gl') {
                const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                return get_data.chart_of_accounts_accounts_category;
            }
        };

        const voucherData = await accounts_model.findOne({
            where: {
                accounts_id: req.params.accounts_id
            }
        });

        if(voucherData) {
            const accounts_list     = req.body.accounts_list;
            const accounts_data     = req.body.accountsFormData;

            const posting_date      = accounts_data.accounts_posting_date;
            // const voucher_type      = accounts_data.accounts_voucher_type;
            const voucher_type      = voucherData.accounts_voucher_type;
            const voucher_type_code = await getVoucherType('code', voucher_type);

            const voucher_count = await accounts_model.count({where:{accounts_voucher_type:voucher_type}})+1;
            const voucher_number = accounts_data.accounts_voucher_number;

            if(accounts_data.accounts_total_debit == accounts_data.accounts_total_credit) {
                const accountsData = await accounts_model.update({
                    accounts_company        : accounts_data.accounts_company,
                    accounts_branch         : accounts_data.accounts_branch,
                    accounts_posting_date   : posting_date,
                    accounts_posting_month  : new Date(posting_date).toLocaleString('default',{month:'long'})+"-"+new Date(posting_date).getFullYear(),
                    accounts_posting_year   : new Date(posting_date).getFullYear(),
                    // accounts_voucher_type   : voucher_type,
                    accounts_voucher_number : voucher_number,
                    accounts_narration      : accounts_data.accounts_narration,
                    accounts_total_debit    : accounts_data.accounts_total_debit,
                    accounts_total_credit   : accounts_data.accounts_total_credit,
                    accounts_status         : accounts_data.accounts_status,
                    accounts_create_by      : user_id
                    },
                    {
                        where: {
                            accounts_id: req.params.accounts_id
                        }
                    });

                if(accountsData) {
                    const accounts_details_data_delete = await accounts_details_model.destroy({
                        where:{
                            accounts_details_accounts: req.params.accounts_id
                        }
                    });

                    const accounts_details_data = await Promise.all(accounts_list.map(async (item) => ({
                        accounts_details_company                : accounts_data.accounts_company,
                        accounts_details_branch                 : accounts_data.accounts_branch,
                        accounts_details_accounts               : req.params.accounts_id,
                        accounts_details_posting_date           : posting_date,
                        accounts_details_posting_month          : new Date(posting_date).toLocaleString('default',{month:'long'})+"-"+new Date(posting_date).getFullYear(),
                        accounts_details_posting_year           : new Date(posting_date).getFullYear(),
                        // accounts_details_voucher_type           : voucher_type,
                        accounts_details_voucher_number         : voucher_number,
                        accounts_details_narration              : accounts_data.accounts_narration,
                        accounts_details_accounts_type          : await getAccountsCatData('at', item.coa_id),
                        accounts_details_accounts_category      : await getAccountsCatData('ac', await getAccountsCatData('cg', await getAccountsCatData('gl', item.coa_id))),
                        accounts_details_control_group          : await getAccountsCatData('cg', await getAccountsCatData('gl', item.coa_id)),
                        accounts_details_general_ledger         : await getAccountsCatData('gl', item.coa_id),
                        accounts_details_subsidiary_ledger      : item.coa_id,
                        accounts_details_debit                  : item.debit,
                        accounts_details_credit                 : item.credit,
                        accounts_details_status                 : 1,
                        accounts_details_create_by              : user_id,
                    })));

                    const accountsDetailsData = await accounts_details_model.bulkCreate(accounts_details_data);
                    const data = await accounts_model.findOne({
                        include : [
                            {
                                model: company_model,
                                attributes: ['company_name'],
                                association: accounts_model.hasOne(company_model, {
                                    foreignKey : 'company_id',
                                    sourceKey : "accounts_company",
                                    required:false
                                }),
                            },
                            {
                                model: branch_model,
                                attributes: ['branch_code', 'branch_name'],
                                association: accounts_model.hasOne(branch_model, {
                                    foreignKey : 'branch_id',
                                    sourceKey : "accounts_branch",
                                    required:false
                                }),
                            },
                            {
                                model: voucher_type_model,
                                attributes: ['voucher_type_code', 'voucher_type_name'],
                                association: accounts_model.hasOne(voucher_type_model, {
                                    foreignKey : 'voucher_type_id',
                                    sourceKey : "accounts_voucher_type",
                                    required:false
                                }),
                            },
                            {
                                model: accounts_details_model,
                                attributes: ['accounts_details_id','accounts_details_accounts', 'accounts_details_accounts_type', 'accounts_details_accounts_category', 'accounts_details_control_group', 'accounts_details_general_ledger', 'accounts_details_subsidiary_ledger', 'accounts_details_debit', 'accounts_details_credit'],
                                association: accounts_model.hasMany(accounts_details_model, {
                                    foreignKey : "accounts_details_accounts",
                                    sourceKey : 'accounts_id',
                                    required:false
                                }),
                                where: {
                                    accounts_details_status: 1,
                                    accounts_details_delete_status: 0
                                },
                                order: [
                                    ['accounts_details_id', 'ASC']
                                ],
                            }
                        ],
                        where:{
                            accounts_id: req.params.accounts_id
                        }
                    });

                    const getAccountsAtData = async(type, data) => {
                        const get_data = await accounts_type_model.findOne({ where:{ accounts_type_id : data } });
                        if(type == 'code') {
                            return get_data.accounts_type_code;
                        } else {
                            return get_data.accounts_type_name;
                        }
                    };

                    const getAccountsCatDataInfo = async(type, data) => {
                        const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_id : data } });
                        if(type == 'code') {
                            return get_data.chart_of_accounts_code;
                        } else {
                            return get_data.chart_of_accounts_name;
                        }
                    };

                    return res.send({
                        status: "1",
                        message: "Voucher Update Successfully!",
                        data: {
                            accounts_id                 : data.accounts_id,
                            accounts_posting_date       : data.accounts_posting_date,
                            accounts_posting_month      : data.accounts_posting_month,
                            accounts_posting_year       : data.accounts_posting_year,
                            accounts_company            : data.accounts_company,
                            accounts_company_name       : data.company.company_name,
                            accounts_branch             : data.accounts_branch,
                            accounts_branch_code        : data.branch.branch_code,
                            accounts_branch_name        : data.branch.branch_name,
                            accounts_voucher_type       : data.accounts_voucher_type,
                            accounts_voucher_type_name  : data.voucher_type.voucher_type_name,
                            accounts_voucher_number     : data.accounts_voucher_number,
                            accounts_narration          : data.accounts_narration,
                            accounts_total_debit        : data.accounts_total_debit,
                            accounts_total_credit       : data.accounts_total_credit,
                            accounts_status             : data.accounts_status,
                            accounts_details            : await Promise.all(data.accounts_details.map(async (row_data) => ({
                                accounts_details_id                     : row_data.accounts_details_id,
                                accounts_details_accounts               : row_data.accounts_details_accounts,
                                accounts_details_accounts_type          : row_data.accounts_details_accounts_type,
                                accounts_details_accounts_type_code     : await getAccountsAtData('code', row_data.accounts_details_accounts_type),
                                accounts_details_accounts_type_name     : await getAccountsAtData('name', row_data.accounts_details_accounts_type),
                                accounts_details_accounts_category      : row_data.accounts_details_accounts_category,
                                accounts_details_accounts_category_code : await getAccountsCatDataInfo('code', row_data.accounts_details_accounts_category),
                                accounts_details_accounts_category_name : await getAccountsCatDataInfo('name', row_data.accounts_details_accounts_category),
                                accounts_details_control_group          : row_data.accounts_details_control_group,
                                accounts_details_control_group_code     : await getAccountsCatDataInfo('code', row_data.accounts_details_control_group),
                                accounts_details_control_group_name     : await getAccountsCatDataInfo('name', row_data.accounts_details_control_group),
                                accounts_details_general_ledger         : row_data.accounts_details_general_ledger,
                                accounts_details_general_ledger_code    : await getAccountsCatDataInfo('code', row_data.accounts_details_general_ledger),
                                accounts_details_general_ledger_name    : await getAccountsCatDataInfo('name', row_data.accounts_details_general_ledger),
                                accounts_details_subsidiary_ledger      : row_data.accounts_details_subsidiary_ledger,
                                accounts_details_subsidiary_ledger_code : await getAccountsCatDataInfo('code', row_data.accounts_details_subsidiary_ledger),
                                accounts_details_subsidiary_ledger_name : await getAccountsCatDataInfo('name', row_data.accounts_details_subsidiary_ledger),
                                accounts_details_debit                  : row_data.accounts_details_debit,
                                accounts_details_credit                 : row_data.accounts_details_credit,
                            }))) || []
                        }
                    });
                } else {
                    return res.send({
                        status: "0",
                        message: "Voucher Update Error !",
                        data: '',
                    });
                }
            } else {
                return res.send({
                    status: "0",
                    message: "Debit & Credit Amount Does Not Match!",
                    data: '',
                });
            }
        }
        return res.send({
            status: "0",
            message: "Voucher ID Not Found!",
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

// Voucher Delete
exports.voucher_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const voucherData = await accounts_model.findOne({
            where: {
                accounts_id: req.params.accounts_id
            }
        });

        if(voucherData) {
            const accountsData = await accounts_model.update({
                accounts_status         : 0,
                accounts_delete_status  : 1,
                accounts_delete_by      : user_id,
                accounts_delete_at      : new Date()
            },
            {
                where:{
                    accounts_id: req.params.accounts_id
                }
            });

            const accountsDetailsData = await accounts_model.update({
                accounts_details_status         : 0,
                accounts_details_delete_status  : 1,
                accounts_details_delete_by      : user_id,
                accounts_details_delete_at      : new Date()
            },
            {
                where:{
                    accounts_details_accounts: req.params.accounts_id
                }
            });

            if(accountsData && accountsDetailsData) {
                return res.send({
                    status: "1",
                    message: "Voucher Delete Successfully!",
                    data: '',
                });
            }
            return res.send({
                status: "0",
                message: "Voucher Delete Delete Error!",
                data: "",
            });
        }
        return res.send({
            status: "0",
            message: "Voucher ID Not Found!",
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

// Voucher Report
exports.ledger_report = async (req, res) => {
    try {
        const company           = req.query.company;
        const branch            = req.query.branch;
        const control_group     = req.query.control_group;
        const general_ledger    = req.query.general_ledger;
        const subsidiary_ledger = req.query.subsidiary_ledger;
        const starting_date     = new Date(req.query.starting_date);
        const closing_date      = new Date(req.query.closing_date);

        const get_cg_coa = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_id: control_group
            }
        });

        let control_group_data = {};
        if(!get_cg_coa) {
            control_group_data = {
                chart_of_accounts_id    : control_group,
                chart_of_accounts_code  : '',
                chart_of_accounts_name  : ''
            }
        } else {
            control_group_data = {
                chart_of_accounts_id    : get_cg_coa.chart_of_accounts_id,
                chart_of_accounts_code  : get_cg_coa.chart_of_accounts_code,
                chart_of_accounts_name  : get_cg_coa.chart_of_accounts_name
            }
        }

        const get_gl_coa = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_id: general_ledger
            }
        });

        let general_ledger_data = {};
        if(!get_gl_coa) {
            general_ledger_data = {
                chart_of_accounts_id    : general_ledger,
                chart_of_accounts_code  : '',
                chart_of_accounts_name  : ''
            }
        } else {
            general_ledger_data = {
                chart_of_accounts_id    : get_gl_coa.chart_of_accounts_id,
                chart_of_accounts_code  : get_gl_coa.chart_of_accounts_code,
                chart_of_accounts_name  : get_gl_coa.chart_of_accounts_name
            }
        }

        const get_sl_coa = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_id: subsidiary_ledger
            }
        });

        let subsidiary_ledger_data = {};
        if(!get_sl_coa) {
            subsidiary_ledger_data = {
                chart_of_accounts_id    : subsidiary_ledger,
                chart_of_accounts_code  : '',
                chart_of_accounts_name    : ''
            }
        } else {
            subsidiary_ledger_data = {
                chart_of_accounts_id    : get_sl_coa.chart_of_accounts_id,
                chart_of_accounts_code  : get_sl_coa.chart_of_accounts_code,
                chart_of_accounts_name  : get_sl_coa.chart_of_accounts_name
            }
        }

        const accounts_date_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const opening_starting_date = new Date(accounts_date_data.accounts_details_posting_date);
        const opening_closing_date  = new Date (new Date(starting_date).getFullYear(), new Date(starting_date).getMonth(), new Date(starting_date).getDate()-1);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const coa_data = await accounts_details_model.findAll({
            include: [
                {
                    ...(subsidiary_ledger > 0?
                        {
                            model: chart_of_accounts_model,
                            association: accounts_details_model.hasOne(chart_of_accounts_model, {
                                foreignKey : 'chart_of_accounts_id',
                                sourceKey : "accounts_details_subsidiary_ledger",
                                required:false
                            })
                        }
                        : (general_ledger > 0)?
                        {
                            model: chart_of_accounts_model,
                            association: accounts_details_model.hasOne(chart_of_accounts_model, {
                                foreignKey : 'chart_of_accounts_id',
                                sourceKey : "accounts_details_general_ledger",
                                required:false
                            })
                        }:
                        {
                            model: chart_of_accounts_model,
                            association: accounts_details_model.hasOne(chart_of_accounts_model, {
                                foreignKey : 'chart_of_accounts_id',
                                sourceKey : "accounts_details_control_group",
                                required:false
                            })
                        }
                    ),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0,
                    },
                    order:[
                        ['chart_of_accounts_code', 'ASC']
                    ]
                }
            ],
            where: {
                ...(subsidiary_ledger > 0?
                    {
                        accounts_details_subsidiary_ledger:subsidiary_ledger
                    }
                    : (general_ledger > 0)?
                    {
                        accounts_details_general_ledger : general_ledger
                    }:
                    {
                        accounts_details_control_group : control_group
                    }
                ),
                accounts_details_company       : company,
                ...(branch == 'all' ?{}         :{ accounts_details_branch : branch}),
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0,
                accounts_details_posting_date   : {
                    [Op.between]: [starting_date, closing_date],
                },

            }
        });

        const get_opening_balance = await accounts_details_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(accounts_details_debit))'),'debit_balance'],
                [sequelize.literal('(SUM(accounts_details_credit))'),'credit_balance'],

                get_cg_coa.chart_of_accounts_accounts_type == 10000000?
                [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                : (get_cg_coa.chart_of_accounts_accounts_type == 20000000) ?
                [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                : (get_cg_coa.chart_of_accounts_accounts_type == 30000000) ?
                [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                :
                [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
            ],
            where:{
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status: 1,
                accounts_details_delete_status: 0,
                ...(subsidiary_ledger > 0?
                    {
                        accounts_details_subsidiary_ledger:subsidiary_ledger,
                    }
                    : (general_ledger > 0)?
                    {
                        accounts_details_general_ledger:general_ledger,
                    }:
                    {
                        accounts_details_control_group : control_group,
                    }
                ),
                accounts_details_posting_date: {
                    [Op.between]: [opening_starting_date, opening_closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });

        const opening_debit_balance = get_opening_balance.dataValues.debit_balance || 0;
        const opening_credit_balance = get_opening_balance.dataValues.credit_balance || 0;
        const net_opening_balance = get_opening_balance.dataValues.balance || 0;

        const opening_balance = {
            debit_balance   : Math.abs(opening_debit_balance).toFixed(2),
            credit_balance  : Math.abs(opening_credit_balance).toFixed(2),
            net_balance     : Math.abs(net_opening_balance).toFixed(2)
        }

        const get_ledger_coa = async(coa_id, coa_accounts) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        ...(subsidiary_ledger > 0?
                            {
                                model: chart_of_accounts_model,
                                association: accounts_details_model.hasOne(chart_of_accounts_model, {
                                    foreignKey : 'chart_of_accounts_id',
                                    sourceKey : "accounts_details_subsidiary_ledger",
                                    required:false
                                })
                            }
                            : (general_ledger > 0)?
                            {
                                model: chart_of_accounts_model,
                                association: accounts_details_model.hasOne(chart_of_accounts_model, {
                                    foreignKey : 'chart_of_accounts_id',
                                    sourceKey : "accounts_details_general_ledger",
                                    required:false
                                })
                            }:
                            {
                                model: chart_of_accounts_model,
                                association: accounts_details_model.hasOne(chart_of_accounts_model, {
                                    foreignKey : 'chart_of_accounts_id',
                                    sourceKey : "accounts_details_control_group",
                                    required:false
                                })
                            }
                        ),
                        where:{
                            chart_of_accounts_company: company,
                            chart_of_accounts_status: 1,
                            chart_of_accounts_delete_status: 0,
                        },
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status: 1,
                    accounts_details_delete_status: 0,
                    ...(subsidiary_ledger > 0?
                        {
                            accounts_details_subsidiary_ledger:{[Op.not]: coa_id},
                        }
                        : (general_ledger > 0)?
                        {
                            accounts_details_general_ledger:{[Op.not]: coa_id},
                        }:
                        {
                            accounts_details_control_group : {[Op.not]: coa_id},
                        }
                    ),
                    accounts_details_accounts: coa_accounts,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });
            const coa_data = await Promise.all(get_data.map(async (row) => {
                net_balance += parseFloat(row.accounts_details_debit) - parseFloat(row.accounts_details_credit);
                return({
                    accounts_details_id                 : row.accounts_details_id,
                    accounts_details_posting_date       : row.accounts_details_posting_date,
                    accounts_details_voucher_type       : row.accounts_details_voucher_type,
                    accounts_details_voucher_number     : row.accounts_details_voucher_number,
                    accounts_details_accounts           : row.accounts_details_accounts,
                    chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                    chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                    chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                    chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                    chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                    chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                    accounts_details_debit              : row.accounts_details_credit,
                    accounts_details_credit             : row.accounts_details_debit,
                    accounts_details_balance            : Math.abs(net_balance)
                })
            }));

            return coa_data;
        };

        let net_balance =

        get_cg_coa.chart_of_accounts_accounts_type == 10000000?
        parseFloat(-opening_balance.net_balance)
        : (get_cg_coa.chart_of_accounts_accounts_type == 20000000)?
        parseFloat(opening_balance.net_balance)
        :
        get_cg_coa.chart_of_accounts_accounts_type == 30000000?
        parseFloat(opening_balance.net_balance)
        :
        parseFloat(-opening_balance.net_balance)
        ;
        const ledger_coa = await Promise.all(coa_data.map(async (row) => ({
            chart_of_accounts_id:row.chart_of_account.chart_of_accounts_id,
            chart_of_accounts_code:row.chart_of_account.chart_of_accounts_code,
            chart_of_accounts_name:row.chart_of_account.chart_of_accounts_name,
            chart_of_accounts_accounts_category:row.chart_of_account.chart_of_accounts_accounts_category,
            chart_of_accounts_accounts_type:row.chart_of_account.chart_of_accounts_accounts_type,
            chart_of_accounts_coa_status:row.chart_of_account.chart_of_accounts_coa_status,
            chart_of_accounts_link:row.chart_of_account.chart_of_accounts_link,

            data    : await get_ledger_coa(row.chart_of_account.chart_of_accounts_id, row.accounts_details_accounts),
        })));

        const sub_total_ledger_debit_balance      = ledger_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.accounts_details_debit), 0), 0);
        const sub_total_ledger_credit_balance     = ledger_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.accounts_details_credit), 0), 0);
        const sub_total_ledger_net_balance        = parseFloat(sub_total_ledger_debit_balance)-parseFloat(sub_total_ledger_credit_balance);

        const ledger_debit_balance      = parseFloat(opening_balance.debit_balance)+ledger_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.accounts_details_debit), 0), 0);
        const ledger_credit_balance     = parseFloat(opening_balance.credit_balance)+ledger_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.accounts_details_credit), 0), 0);
        const ledger_net_balance        = parseFloat(ledger_debit_balance)-parseFloat(ledger_credit_balance);

        const sub_total_balance = {
            debit_balance   : Math.abs(sub_total_ledger_debit_balance).toFixed(2),
            credit_balance  : Math.abs(sub_total_ledger_credit_balance).toFixed(2),
            net_balance     : Math.abs(sub_total_ledger_net_balance).toFixed(2),
        }
        const closing_balance = {
            debit_balance   : Math.abs(ledger_debit_balance).toFixed(2),
            credit_balance  : Math.abs(ledger_credit_balance).toFixed(2),
            net_balance     : Math.abs(ledger_net_balance).toFixed(2),
        }

        return res.send({
            status: "1",
            message: "General Ledger Find Successfully!",
            data: {
                opening_balance         : opening_balance,
                sub_total_balance       : sub_total_balance,
                closing_balance         : closing_balance,
                coa_data                : ledger_coa,
                starting_closing_date   :{starting_date, closing_date},
                company                 : company_data,
                branch                  : branch_data,
                control_group_data      : control_group_data,
                general_ledger_data     : general_ledger_data,
                subsidiary_ledger_data  : subsidiary_ledger_data
            }
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

// Balance Sheet
exports.balance_sheet = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_month = new Date(req.query.closing_month);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const starting_date = new Date(accounts_data.accounts_details_posting_date) || new Date();

        const financial_year_closing_month   = financial_year.financial_year_closing_month;

        let current_month_closing_date  = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()+1, 0);
        let last_month_closing_date     = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);

        let current_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear()+1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        const get_income_expenditure_balance = async() => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance    = last_month_data.dataValues.balance || 0;
            const current_year_balance  = current_year_data.dataValues.balance || 0;
            const last_year_balance     = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const income_expenditure_balance            = await get_income_expenditure_balance();
        const c_month_income_expenditure_balance    = income_expenditure_balance.current_month_balance;
        const l_month_income_expenditure_balance    = income_expenditure_balance.last_month_balance;
        const c_year_income_expenditure_balance     = income_expenditure_balance.current_year_balance;
        const l_year_income_expenditure_balance     = income_expenditure_balance.last_year_balance;

        const get_at_balance = async(data) => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = data == 20000000?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = data == 20000000?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = data == 20000000?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = data == 20000000?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_cat_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_cg_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });
            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group      : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_cg'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_gl_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });
            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_sl_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });
            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_sl = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_sl_balance(row.chart_of_accounts_id),
            })));

            return get_data || [];
        };

        const get_gl = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_gl_balance(row.chart_of_accounts_id),
                subsidiary_ledger       : await get_sl(row.chart_of_accounts_id),
            })));

            return get_data || [];
        };

        const get_cg = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_cg_balance(row.chart_of_accounts_id),
                general_ledger          : await get_gl(row.chart_of_accounts_id),
            })));

            return get_data || [];
        };

        const get_cat = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_cat_balance(row.chart_of_accounts_id),
                control_group           : await get_cg(row.chart_of_accounts_id),
            })));

            return get_data || [];
        };

        const chart_of_accounts = await accounts_type_model.findAll({
            where: {
                accounts_type_status: 1,
                accounts_type_delete_status: 0,
                [Op.or]: [
                    {
                        accounts_type_code: 10000000
                    },
                    {
                        accounts_type_code:20000000
                    }
                ]
            },
            order: [
                ['accounts_type_code', 'ASC']
            ]
        });

        const coa_data = await Promise.all(chart_of_accounts.map(async (row) => ({
            chart_of_accounts_id            : row.accounts_type_id,
            chart_of_accounts_code          : row.accounts_type_code,
            chart_of_accounts_name          : row.accounts_type_name,
            balance                         : await get_at_balance(row.accounts_type_id),
            accounts_category               : await get_cat(row.accounts_type_id)
        })));

        return res.send({
            status: "1",
            message: "Balance Sheet Find Successfully!",
            data: {
                coa_data: coa_data,
                closing_month_year: {
                    current_month_closing_date, last_month_closing_date, current_year_closing_date, last_year_closing_date
                },
                company: company_data,
                branch: branch_data,
                financial_year: financial_year
            }
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

// Balance Sheet Note
exports.balance_sheet_note = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_month = new Date(req.query.closing_month);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const starting_date = new Date(accounts_data.accounts_details_posting_date) || new Date();

        const financial_year_closing_month   = financial_year.financial_year_closing_month;

        let current_month_closing_date  = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()+1, 0);
        let last_month_closing_date     = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);

        let current_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear()+1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        const get_income_expenditure_balance = async() => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance    = last_month_data.dataValues.balance || 0;
            const current_year_balance  = current_year_data.dataValues.balance || 0;
            const last_year_balance     = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const income_expenditure_balance            = await get_income_expenditure_balance();
        const c_month_income_expenditure_balance    = income_expenditure_balance.current_month_balance;
        const l_month_income_expenditure_balance    = income_expenditure_balance.last_month_balance;
        const c_year_income_expenditure_balance     = income_expenditure_balance.current_year_balance;
        const l_year_income_expenditure_balance     = income_expenditure_balance.last_year_balance;

        const get_sl_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });
            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_gl_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });
            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_sl = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_sl_balance(row.chart_of_accounts_id),
            })));

            return get_data || [];
        };

        const get_gl = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_gl_balance(row.chart_of_accounts_id),
                subsidiary_ledger       : await get_sl(row.chart_of_accounts_id),
            })));

            return get_data || [];
        };

        const chart_of_accounts = await chart_of_accounts_model.findAll({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'control_group',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 10000000
                    },
                    {
                        chart_of_accounts_accounts_type: 20000000
                    }
                ],
            },
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const coa_data = await Promise.all(chart_of_accounts.map(async (row) => ({
            chart_of_accounts_id            : row.chart_of_accounts_id,
            chart_of_accounts_code          : row.chart_of_accounts_code,
            chart_of_accounts_name          : row.chart_of_accounts_name,
            balance                         : await get_gl_balance(row.chart_of_accounts_id),
            general_ledger                  : await get_gl(row.chart_of_accounts_id)
        })));

        return res.send({
            status: "1",
            message: "Balance Sheet Find Successfully!",
            data: {
                coa_data: coa_data,
                closing_month_year: {
                    current_month_closing_date, last_month_closing_date, current_year_closing_date, last_year_closing_date
                },
                company: company_data,
                branch: branch_data,
                financial_year: financial_year
            }
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

// Get Balance Sheet Note
exports.get_balance_sheet_note = async (req, res) => {
    try {
        const note          = req.query.note;
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_month = new Date(req.query.closing_month);
        const coa           = req.query.coa;

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const starting_date = new Date(accounts_data.accounts_details_posting_date) || new Date();

        const financial_year_closing_month   = financial_year.financial_year_closing_month;

        let current_month_closing_date  = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()+1, 0);
        let last_month_closing_date     = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);

        let current_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear()+1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        const get_income_expenditure_balance = async() => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date   : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance    = last_month_data.dataValues.balance || 0;
            const current_year_balance  = current_year_data.dataValues.balance || 0;
            const last_year_balance     = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const income_expenditure_balance            = await get_income_expenditure_balance();
        const c_month_income_expenditure_balance    = income_expenditure_balance.current_month_balance;
        const l_month_income_expenditure_balance    = income_expenditure_balance.last_month_balance;
        const c_year_income_expenditure_balance     = income_expenditure_balance.current_year_balance;
        const l_year_income_expenditure_balance     = income_expenditure_balance.last_year_balance;

        const get_sl_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });
            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_sl'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_gl_balance = async(data) => {
            const get_coa = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });
            const type = get_coa.chart_of_accounts_accounts_type;

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_month_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, current_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[type == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company            : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger     : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date       : {[Op.between]: [starting_date, last_year_closing_date]}
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const c_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(current_month_data.dataValues.balance || 0)+parseFloat(c_month_income_expenditure_balance)).toFixed(2):current_month_data.dataValues.balance;
            const l_month_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(last_month_data.dataValues.balance || 0)+parseFloat(l_month_income_expenditure_balance)).toFixed(2):last_month_data.dataValues.balance;
            const c_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(current_year_data.dataValues.balance || 0)+parseFloat(c_year_income_expenditure_balance)).toFixed(2):current_year_data.dataValues.balance;
            const l_year_balance = get_coa.chart_of_accounts_link == 'income_expenditure_gl'?(parseFloat(last_year_data.dataValues.balance || 0)+parseFloat(l_year_income_expenditure_balance)).toFixed(2):last_year_data.dataValues.balance;

            const current_month_balance = c_month_balance || 0;
            const last_month_balance    = l_month_balance || 0;
            const current_year_balance  = c_year_balance || 0;
            const last_year_balance     = l_year_balance || 0;

            const balance = {
                current_month_balance,
                last_month_balance,
                current_year_balance,
                last_year_balance
            }

            return balance;
        };

        const get_sl = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_sl_balance(row.chart_of_accounts_id),
            })));

            return get_data || [];
        };

        const chart_of_accounts = await chart_of_accounts_model.findOne({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_id                : coa,
            },
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const coa_data = {
            chart_of_accounts_id            : chart_of_accounts.chart_of_accounts_id,
            chart_of_accounts_code          : chart_of_accounts.chart_of_accounts_code,
            chart_of_accounts_name          : chart_of_accounts.chart_of_accounts_name,
            balance                         : await get_gl_balance(chart_of_accounts.chart_of_accounts_id),
            subsidiary_ledger               : await get_sl(chart_of_accounts.chart_of_accounts_id)
        };

        return res.send({
            status: "1",
            message: "Balance Sheet Find Successfully!",
            data: {
                coa_data,
                note,
                closing_month_year: {
                    current_month_closing_date, last_month_closing_date, current_year_closing_date, last_year_closing_date
                },
                company: company_data,
                branch: branch_data,
                financial_year: financial_year
            }
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

// Income Expenditure
exports.income_expenditure = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_month = new Date(req.query.closing_month);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const financial_year_starting_date  = financial_year.financial_year_starting_date;
        const financial_year_closing_month   = financial_year.financial_year_closing_month;

        let current_month_start_date    = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 2);
        let current_month_closing_date  = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()+1, 0);
        let last_month_start_date       = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()-1, 2);
        let last_month_closing_date     = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);

        let current_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            current_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            current_year_start_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_starting_date).getMonth(), 2);
        }

        let current_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear()+1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-2, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        }

        let last_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        const get_balance_sheet_cg_coa = await chart_of_accounts_model.count({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'control_group',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 10000000
                    },
                    {
                        chart_of_accounts_accounts_type: 20000000
                    }
                ],
            },
            distinct: true,
            col: 'chart_of_accounts_id',
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const get_balance_sheet_gl_coa = await chart_of_accounts_model.count({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'general_ledger',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 10000000
                    },
                    {
                        chart_of_accounts_accounts_type: 20000000
                    }
                ],
            },
            distinct: true,
            col: 'chart_of_accounts_id',
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const get_cat = async(data) => {
            const cat_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cat_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_cat_balance(row.chart_of_accounts_id),
                control_group           : await get_cg(row.chart_of_accounts_id),
            })));

            return get_data;
        };

        const get_cg = async(data) => {
            const cg_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(cg_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_cg_balance(row.chart_of_accounts_id),
                general_ledger          : await get_gl(row.chart_of_accounts_id),
            })));

            return get_data;
        };

        const get_gl = async(data) => {
            const gl_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(gl_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_gl_balance(row.chart_of_accounts_id),
            })));

            return get_data;
        };

        const get_at_balance = async(data) => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });


            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance    = last_month_data.dataValues.balance || 0;
            const current_year_balance  = current_year_data.dataValues.balance || 0;
            const last_year_balance     = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_cat_balance = async(data) => {
            const get_at = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category : data,
                    accounts_details_status            : 1,
                    accounts_details_delete_status     : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category : data,
                    accounts_details_status            : 1,
                    accounts_details_delete_status     : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category : data,
                    accounts_details_status            : 1,
                    accounts_details_delete_status     : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category : data,
                    accounts_details_status            : 1,
                    accounts_details_delete_status     : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_cg_balance = async(data) => {
            const get_at = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance ||0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_gl_balance = async(data) => {
            const get_at = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date   : {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    }
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_surplus_deficit = async() => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const chart_of_accounts = await accounts_type_model.findAll({
            where: {
                accounts_type_status: 1,
                accounts_type_delete_status: 0,
                [Op.or]: [
                    {
                        accounts_type_id: 30000000
                    },
                    {
                        accounts_type_id:40000000
                    }
                ]
            },
            order: [
                ['accounts_type_code', 'ASC']
            ]
        });

        const coa_data = await Promise.all(chart_of_accounts.map(async (row) => ({
            chart_of_accounts_id            : row.accounts_type_id,
            chart_of_accounts_code          : row.accounts_type_code,
            chart_of_accounts_name          : row.accounts_type_name,
            balance                     : await get_at_balance(row.accounts_type_code),
            accounts_category           : await get_cat(row.accounts_type_code)
        })));

        return res.send({
            status: "1",
            message: "Income Expenditure Find Successfully!",
            data: {
                coa_data: coa_data,
                surplus_deficit: await get_surplus_deficit(),
                closing_month_year: {
                    current_month_start_date, current_month_closing_date, last_month_start_date, last_month_closing_date, current_year_start_date, current_year_closing_date, last_year_start_date, last_year_closing_date
                },
                company: company_data,
                branch: branch_data,
                financial_year: financial_year,
                balance_sheet_note: {
                    balance_sheet_note_cg: get_balance_sheet_cg_coa,
                    balance_sheet_note_gl: get_balance_sheet_gl_coa
                }
            }
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

// Income Expenditure Note
exports.income_expenditure_note = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_month = new Date(req.query.closing_month);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const financial_year_starting_date  = financial_year.financial_year_starting_date;
        const financial_year_closing_month   = financial_year.financial_year_closing_month;

        let current_month_start_date    = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 2);
        let current_month_closing_date  = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()+1, 0);
        let last_month_start_date       = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()-1, 2);
        let last_month_closing_date     = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);

        let current_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            current_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            current_year_start_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_starting_date).getMonth(), 2);
        }

        let current_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear()+1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-2, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        }

        let last_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        const get_balance_sheet_cg_coa = await chart_of_accounts_model.count({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'control_group',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 10000000
                    },
                    {
                        chart_of_accounts_accounts_type: 20000000
                    }
                ],
            },
            distinct: true,
            col: 'chart_of_accounts_id',
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const get_balance_sheet_gl_coa = await chart_of_accounts_model.count({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'general_ledger',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 10000000
                    },
                    {
                        chart_of_accounts_accounts_type: 20000000
                    }
                ],
            },
            distinct: true,
            col: 'chart_of_accounts_id',
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const get_sl_balance = async(data) => {
            const get_at = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger: data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date   : {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    }
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_gl_balance = async(data) => {
            const get_at = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date   : {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    }
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_sl = async(data) => {
            const sl_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(sl_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_sl_balance(row.chart_of_accounts_id)
            })));

            return get_data;
        };

        const get_gl = async(data) => {
            const gl_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(gl_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_gl_balance(row.chart_of_accounts_id),
                subsidiary_ledger       : await get_sl(row.chart_of_accounts_id)
            })));

            return get_data;
        };

        const get_surplus_deficit = async() => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const chart_of_accounts = await chart_of_accounts_model.findAll({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'control_group',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 30000000
                    },
                    {
                        chart_of_accounts_accounts_type: 40000000
                    }
                ],
            },
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const coa_data = await Promise.all(chart_of_accounts.map(async (row) => ({
            chart_of_accounts_id            : row.chart_of_accounts_id,
            chart_of_accounts_code          : row.chart_of_accounts_code,
            chart_of_accounts_name          : row.chart_of_accounts_name,
            balance                         : await get_gl_balance(row.chart_of_accounts_id),
            general_ledger                  : await get_gl(row.chart_of_accounts_id)
        })));

        return res.send({
            status: "1",
            message: "Income Expenditure Find Successfully!",
            data: {
                coa_data: coa_data,
                surplus_deficit: await get_surplus_deficit(),
                closing_month_year: {
                    current_month_start_date, current_month_closing_date, last_month_start_date, last_month_closing_date, current_year_start_date, current_year_closing_date, last_year_start_date, last_year_closing_date
                },
                company: company_data,
                branch: branch_data,
                financial_year: financial_year,
                balance_sheet_note: {
                    balance_sheet_note_cg: get_balance_sheet_cg_coa,
                    balance_sheet_note_gl: get_balance_sheet_gl_coa
                }
            }
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

// Get Income Expenditure Note
exports.get_income_expenditure_note = async (req, res) => {
    try {
        const note          = req.query.note;
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_month = new Date(req.query.closing_month);
        const coa           = req.query.coa;

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const financial_year_starting_date  = financial_year.financial_year_starting_date;
        const financial_year_closing_month   = financial_year.financial_year_closing_month;

        let current_month_start_date    = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 2);
        let current_month_closing_date  = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()+1, 0);
        let last_month_start_date       = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()-1, 2);
        let last_month_closing_date     = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);

        let current_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            current_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            current_year_start_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_starting_date).getMonth(), 2);
        }

        let current_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear()+1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-2, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        }

        let last_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        const get_balance_sheet_cg_coa = await chart_of_accounts_model.count({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'control_group',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 10000000
                    },
                    {
                        chart_of_accounts_accounts_type: 20000000
                    }
                ],
            },
            distinct: true,
            col: 'chart_of_accounts_id',
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const get_balance_sheet_gl_coa = await chart_of_accounts_model.count({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_coa_status        : 'general_ledger',
                [Op.or]: [
                    {
                        chart_of_accounts_accounts_type: 10000000
                    },
                    {
                        chart_of_accounts_accounts_type: 20000000
                    }
                ],
            },
            distinct: true,
            col: 'chart_of_accounts_id',
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const get_sl_balance = async(data) => {
            const get_at = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger: data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_subsidiary_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date   : {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    }
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_gl_balance = async(data) => {
            const get_at = await chart_of_accounts_model.findOne({
                where:{
                    chart_of_accounts_id:data
                }
            });

            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    ...[get_at.chart_of_accounts_accounts_type == 40000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company       : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date   : {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    }
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_sl = async(data) => {
            const sl_data = await chart_of_accounts_model.findAll({
                where:{
                    chart_of_accounts_company           : company,
                    chart_of_accounts_accounts_category : data,
                    chart_of_accounts_status            : 1,
                    chart_of_accounts_delete_status     : 0,
                },
                order: [
                    ['chart_of_accounts_code', 'ASC']
                ]
            });

            const get_data = await Promise.all(sl_data.map(async (row) => ({
                chart_of_accounts_id    : row.chart_of_accounts_id,
                chart_of_accounts_code  : row.chart_of_accounts_code,
                chart_of_accounts_name  : row.chart_of_accounts_name,
                balance                 : await get_sl_balance(row.chart_of_accounts_id)
            })));

            return get_data;
        };

        const chart_of_accounts = await chart_of_accounts_model.findOne({
            where:{
                chart_of_accounts_company           : company,
                chart_of_accounts_status            : 1,
                chart_of_accounts_delete_status     : 0,
                chart_of_accounts_id                : coa,
                chart_of_accounts_coa_status        : 'general_ledger'
            },
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const coa_data = {
            chart_of_accounts_id            : chart_of_accounts.chart_of_accounts_id,
            chart_of_accounts_code          : chart_of_accounts.chart_of_accounts_code,
            chart_of_accounts_name          : chart_of_accounts.chart_of_accounts_name,
            balance                         : await get_gl_balance(chart_of_accounts.chart_of_accounts_id),
            subsidiary_ledger               : await get_sl(chart_of_accounts.chart_of_accounts_id)
        };

        return res.send({
            status: "1",
            message: "Income Expenditure Find Successfully!",
            data: {
                coa_data,
                note,
                closing_month_year: {
                    current_month_start_date, current_month_closing_date, last_month_start_date, last_month_closing_date, current_year_start_date, current_year_closing_date, last_year_start_date, last_year_closing_date
                },
                company: company_data,
                branch: branch_data,
                financial_year: financial_year,
                balance_sheet_note: {
                    balance_sheet_note_cg: get_balance_sheet_cg_coa,
                    balance_sheet_note_gl: get_balance_sheet_gl_coa
                }
            }
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

exports.trial_balance = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_date  = new Date(req.query.closing_date);

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const starting_date = new Date(accounts_data.accounts_details_posting_date);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const get_general_ledger_balance = async(type, data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                ],
                where:{
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let debit_balance;
            let credit_balance;

            if(type == 10000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            } else if(type == 20000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(type == 30000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(type == 40000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            }
            const balance = {debit_balance:debit_balance || 0, credit_balance:credit_balance || 0};

            return balance;
        };

        const get_general_ledger = async(data) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        model: chart_of_accounts_model,
                        association: accounts_details_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_details_general_ledger",
                            required:false
                        }),
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status: 1,
                    accounts_details_delete_status: 0,
                    accounts_details_control_group: data,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                group: [
                    ['accounts_details_general_ledger', 'ASC']
                ]
            });

            const general_ledger_data = await Promise.all(get_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                balance                             : await get_general_ledger_balance(row.chart_of_account.chart_of_accounts_accounts_type, row.chart_of_account.chart_of_accounts_id)
            })));

            return general_ledger_data;
        };

        const get_control_group_balance = async(type, data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                ],
                where:{
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_control_group  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let debit_balance;
            let credit_balance;

            if(type == 10000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            } else if(type == 20000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(type == 30000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(type == 40000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            }
            const balance = {debit_balance:debit_balance || 0, credit_balance:credit_balance || 0};

            return balance;
        };

        const get_control_group = async(data) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        model: chart_of_accounts_model,
                        association: accounts_details_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_details_control_group",
                            required:false
                        }),
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category: data,
                    accounts_details_status: 1,
                    accounts_details_delete_status: 0,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                group: [
                    ['accounts_details_control_group', 'ASC']
                ]
            });

            const control_group_data = await Promise.all(get_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                balance                             : await get_control_group_balance(row.chart_of_account.chart_of_accounts_accounts_type, row.chart_of_account.chart_of_accounts_id),
                general_ledger                      : await get_general_ledger(row.chart_of_account.chart_of_accounts_id)
            })));

            return control_group_data;
        };

        const get_accounts_category_balance = async(type, data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                ],
                where:{
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_category  : data,
                    accounts_details_status             : 1,
                    accounts_details_delete_status      : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let debit_balance;
            let credit_balance;

            if(type == 10000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            } else if(type == 20000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(type == 30000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(type == 40000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            }
            const balance = {debit_balance:debit_balance || 0, credit_balance:credit_balance || 0};

            return balance;
        };

        const get_accounts_type_balance = async(data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date   : {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let debit_balance;
            let credit_balance;

            if(data == 10000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            } else if(data == 20000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(data == 30000000) {
                debit_balance   = 0;
                credit_balance  = balance_data;
            } else if(data == 40000000) {
                debit_balance   = balance_data;
                credit_balance  = 0;
            }
            const balance = {debit_balance:debit_balance || 0, credit_balance:credit_balance || 0};

            return balance;
        };

        const get_accounts_category = async(data) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        model: chart_of_accounts_model,
                        association: accounts_details_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_details_accounts_category",
                            required:false
                        }),
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_accounts_type  : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date   : {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                group: [
                    ['accounts_details_accounts_category', 'ASC']
                ]
            });

            const accounts_category_data = await Promise.all(get_data.map(async (row) => ({
                chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                balance                             : await get_accounts_category_balance(row.chart_of_account.chart_of_accounts_accounts_type, row.chart_of_account.chart_of_accounts_id),
                control_group                       : await get_control_group(row.chart_of_account.chart_of_accounts_id)
            })));

            return accounts_category_data;
        };

        const trial_balance_coa = await accounts_details_model.findAll({
            include: [
                {
                    model: accounts_type_model,
                    association: accounts_details_model.hasOne(accounts_type_model, {
                        foreignKey : 'accounts_type_id',
                        sourceKey : "accounts_details_accounts_type",
                        required:false
                    }),
                    order:[
                        ['accounts_type_code', 'ASC']
                    ]
                }
            ],
            where: {
                accounts_details_company         : company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0,
            },
            group: [
                ['accounts_details_accounts_type', 'ASC']
            ]
        });
        const trial_balance_data = await Promise.all(trial_balance_coa.map(async (row) => ({
            chart_of_accounts_id            : row.accounts_type.accounts_type_id,
            chart_of_accounts_code          : row.accounts_type.accounts_type_code,
            chart_of_accounts_name          : row.accounts_type.accounts_type_name,
            balance                         : await get_accounts_type_balance(row.accounts_type.accounts_type_id),
            accounts_category               : await get_accounts_category(row.accounts_type.accounts_type_id)
        })));

        const total_balance_data = {
            debit_balance   : trial_balance_data.reduce((acc, item) => acc + parseFloat(item.balance.debit_balance), 0),
            credit_balance  : trial_balance_data.reduce((acc, item) => acc + parseFloat(item.balance.credit_balance), 0),
        }

        return res.send({
            status: "1",
            message: "Receipts & Payments Find Successfully!",
            data: {
                trial_balance:trial_balance_data,
                total_balance:total_balance_data,
                starting_closing_date:{starting_date, closing_date},
                company: company_data,
                branch: branch_data,
            }
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

// Receipts Payments
exports.receipts_payments = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const starting_date = new Date(req.query.starting_date);
        const closing_date  = new Date(req.query.closing_date);

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const opening_starting_date = new Date(accounts_data.accounts_details_posting_date);
        const opening_closing_date  = new Date (new Date(starting_date).getFullYear(), new Date(starting_date).getMonth(), new Date(starting_date).getDate()-1);

        const closing_starting_date = new Date(accounts_data.accounts_details_posting_date);
        const closing_closing_date  = new Date(req.query.closing_date);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const cash_bank_coa = await chart_of_accounts_model.findAll({
            where: {
                chart_of_accounts_company: company,
                chart_of_accounts_status: 1,
                chart_of_accounts_delete_status: 0,
                [Op.or]: [
                    {
                        chart_of_accounts_link: 'cash_in_hand'
                    },
                    {
                        chart_of_accounts_link:'cash_at_bank'
                    }
                ]
            },
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });
        const coa_bank_data = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company: company,
                chart_of_accounts_status: 1,
                chart_of_accounts_delete_status: 0,
                chart_of_accounts_link: 'cash_at_bank'
            }
        });

        const coa_cash_bank_data = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company: company,
                chart_of_accounts_status: 1,
                chart_of_accounts_delete_status: 0,
                chart_of_accounts_link: 'cash_in_hand_bank'
            }
        });

        const get_cash_bank_opening_balance = async(data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [opening_starting_date, opening_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let balanceData;

            if(balance_data > 0) {
                balanceData = Math.abs(balance_data).toFixed(2);
            } else {
                balanceData = 0;
            }
            const balance = balanceData;
            return balance;
        };

        const get_cash_bank_closing_balance = async(data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    ...[data == 10000000?
                        [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                        :
                        [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                    ]
                ],
                where:{
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [closing_starting_date, closing_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let balanceData;

            if(balance_data > 0) {
                balanceData = Math.abs(balance_data).toFixed(2);
            } else {
                balanceData = 0;
            }
            const balance = balanceData;
            return balance;
        };

        const cash_bank_opening_coa_data = await Promise.all(cash_bank_coa.map(async (row) => ({
            chart_of_accounts_id                : row.chart_of_accounts_id,
            chart_of_accounts_code              : row.chart_of_accounts_code,
            chart_of_accounts_name              : row.chart_of_accounts_name,
            chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
            chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
            chart_of_accounts_link              : row.chart_of_accounts_link || '',
            amount                              : await get_cash_bank_opening_balance(row.chart_of_accounts_id)
        })));

        const cash_bank_closing_coa_data = await Promise.all(cash_bank_coa.map(async (row) => ({
            chart_of_accounts_id                : row.chart_of_accounts_id,
            chart_of_accounts_code              : row.chart_of_accounts_code,
            chart_of_accounts_name              : row.chart_of_accounts_name,
            chart_of_accounts_accounts_category : row.chart_of_accounts_accounts_category,
            chart_of_accounts_accounts_type     : row.chart_of_accounts_accounts_type,
            chart_of_accounts_link              : row.chart_of_accounts_link || '',
            amount                              : await get_cash_bank_closing_balance(row.chart_of_accounts_id)
        })));

        const receipts_coa = await accounts_details_model.findAll({
            include: [
                {
                    model: chart_of_accounts_model,
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0,
                        chart_of_accounts_accounts_category:{[Op.not]: coa_cash_bank_data.chart_of_accounts_id}
                    },
                    order:[
                        ['chart_of_accounts_code', 'ASC']
                    ]
                }
            ],
            where: {
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status: 1,
                accounts_details_delete_status: 0,
                accounts_details_voucher_type: 1, //1 = Receive Voucher
                accounts_details_posting_date: {
                    [Op.between]: [starting_date, closing_date],
                },
            },
            group: [
                ['accounts_details_general_ledger', 'ASC']
            ]
        });

        const payments_coa = await accounts_details_model.findAll({
            include: [
                {
                    model: chart_of_accounts_model,
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_accounts_category:{[Op.not]: coa_cash_bank_data.chart_of_accounts_id}
                    },
                    order:[
                        ['chart_of_accounts_code', 'ASC']
                    ]
                }
            ],
            where: {
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status: 1,
                accounts_details_delete_status: 0,
                accounts_details_voucher_type: 2, //2 = Payment Voucher
                accounts_details_posting_date: {
                    [Op.between]: [starting_date, closing_date],
                },
            },
            group: [
                ['accounts_details_general_ledger', 'ASC']
            ]
        });

        const get_receipts_balance = async(data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('SUM(accounts_details_credit)'),'balance']
                ],
                where:{
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_voucher_type : 1,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let balanceData;

            if(balance_data > 0) {
                balanceData = Math.abs(balance_data).toFixed(2);
            } else {
                balanceData = 0;
            }
            const balance = balanceData;
            return balance;
        };

        const get_payments_balance = async(data) => {
            const get_balance = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('SUM(accounts_details_debit)'),'balance']
                ],
                where:{
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_general_ledger : data,
                    accounts_details_voucher_type   : 2,
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const balance_data = Math.abs(get_balance.dataValues.balance).toFixed(2) || 0;

            let balanceData;

            if(balance_data > 0) {
                balanceData = Math.abs(balance_data).toFixed(2);
            } else {
                balanceData = 0;
            }
            const balance = balanceData;
            return balance;
        };

        const receipts_coa_data = await Promise.all(receipts_coa.map(async (row) => ({
            accounts_details_id                 : row.accounts_details_id,
            accounts_details_voucher_type       : row.accounts_details_voucher_type,
            accounts_details_general_ledger     : row.accounts_details_general_ledger,
            chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
            chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
            chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
            chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
            chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
            chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
            amount                              : await get_receipts_balance(row.chart_of_account.chart_of_accounts_id)
        })));

        const payments_coa_data = await Promise.all(payments_coa.map(async (row) => ({
            accounts_details_id                 : row.accounts_details_id,
            accounts_details_voucher_type       : row.accounts_details_voucher_type,
            accounts_details_general_ledger     : row.accounts_details_general_ledger,
            chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
            chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
            chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
            chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
            chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
            chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
            amount                              : await get_payments_balance(row.chart_of_account.chart_of_accounts_id)
        })));

        const opening_total_amount_data  = cash_bank_opening_coa_data.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        const closing_total_amount_data  = cash_bank_closing_coa_data.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        const receipts_total_amount_data = opening_total_amount_data + receipts_coa_data.reduce((acc, item) => acc + parseFloat(item.amount), 0);
        const payments_total_amount_data = closing_total_amount_data + payments_coa_data.reduce((acc, item) => acc + parseFloat(item.amount), 0);

        const opening_total_amount  = opening_total_amount_data;
        const closing_total_amount  = closing_total_amount_data;
        const receipts_total_amount = receipts_total_amount_data;
        const payments_total_amount = payments_total_amount_data;

        return res.send({
            status: "1",
            message: "Receipts & Payments Find Successfully!",
            data: {
                cash_bank_opening_coa : cash_bank_opening_coa_data,receipts_coa:receipts_coa_data,
                payments_coa:payments_coa_data, cash_bank_closing_coa : cash_bank_closing_coa_data,
                receipts_payments_total_amount:{receipts_total_amount, payments_total_amount},
                starting_closing_date:{starting_date, closing_date},
                company: company_data,
                branch: branch_data,
            }
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

// Cash Book
exports.cash_book = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const starting_date = new Date(req.query.starting_date);
        const closing_date  = new Date(req.query.closing_date);

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const opening_starting_date = new Date(accounts_data.accounts_details_posting_date);
        const opening_closing_date  = new Date (new Date(starting_date).getFullYear(), new Date(starting_date).getMonth(), new Date(starting_date).getDate()-1);

        const closing_starting_date = new Date(accounts_data.accounts_details_posting_date);
        const closing_closing_date  = new Date(req.query.closing_date);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const cash_coa = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company: company,
                chart_of_accounts_status: 1,
                chart_of_accounts_delete_status: 0,
                chart_of_accounts_link: 'cash_in_hand'
            },
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const cash_opening_balance_data = await accounts_details_model.findOne({
            attributes: [
                ...[cash_coa.chart_of_accounts_accounts_type == 10000000?
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                    :
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ]
            ],
            where:{
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_general_ledger : cash_coa.chart_of_accounts_id,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0,
                accounts_details_posting_date: {
                    [Op.between]: [opening_starting_date, opening_closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });

        const cash_opening_balance = parseFloat(cash_opening_balance_data.dataValues.balance || 0).toFixed(2);


        const cash_closing_balance_data = await accounts_details_model.findOne({
            attributes: [
                ...[cash_coa.chart_of_accounts_accounts_type == 10000000?
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                    :
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ]
            ],
            where:{
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_general_ledger : cash_coa.chart_of_accounts_id,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0,
                accounts_details_posting_date: {
                    [Op.between]: [closing_starting_date, closing_closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });

        const cash_closing_balance = parseFloat(cash_closing_balance_data.dataValues.balance || 0).toFixed(2);

        const debit_coa_data = await accounts_details_model.findAll({
            attributes: ['accounts_details_id', 'accounts_details_accounts', 'accounts_details_debit', 'accounts_details_credit'],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_link'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0,
                    },
                    order:[
                        ['chart_of_accounts_code', 'ASC']
                    ]
                }
            ],
            where: {
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status: 1,
                accounts_details_delete_status: 0,
                accounts_details_voucher_type: 1, //1 = Receive Voucher
                accounts_details_general_ledger: cash_coa.chart_of_accounts_id,
                accounts_details_posting_date: {
                    [Op.between]: [starting_date, closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });
        const get_debit_coa = async(coa_id, coa_accounts) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        model: chart_of_accounts_model,
                        association: accounts_details_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_details_subsidiary_ledger",
                            required:false
                        }),
                        where:{
                            chart_of_accounts_company: company,
                            chart_of_accounts_status: 1,
                            chart_of_accounts_delete_status: 0,
                        },
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status: 1,
                    accounts_details_delete_status: 0,
                    accounts_details_voucher_type: 1, //1 = Receive Voucher
                    accounts_details_general_ledger:{[Op.not]: coa_id},
                    accounts_details_accounts: coa_accounts,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const coa_data = await Promise.all(get_data.map(async (row) => ({
                accounts_details_id                 : row.accounts_details_id,
                accounts_details_accounts           : row.accounts_details_accounts,
                accounts_details_posting_date       : row.accounts_details_posting_date,
                accounts_details_voucher_type       : row.accounts_details_voucher_type,
                accounts_details_voucher_number     : row.accounts_details_voucher_number,
                chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                amount                              : row.accounts_details_credit
            })));

            return coa_data;
        };
        const debit_coa = await Promise.all(debit_coa_data.map(async (row) => ({
            data    : await get_debit_coa(row.chart_of_account.chart_of_accounts_id, row.accounts_details_accounts),
        })));

        const credit_coa_data = await accounts_details_model.findAll({
            attributes: ['accounts_details_id', 'accounts_details_accounts', 'accounts_details_debit', 'accounts_details_credit'],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_link'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0,
                    },
                    order:[
                        ['chart_of_accounts_code', 'ASC']
                    ]
                }
            ],
            where: {
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status: 1,
                accounts_details_delete_status: 0,
                accounts_details_voucher_type: 2, //2 = Payment Voucher
                accounts_details_general_ledger: cash_coa.chart_of_accounts_id,
                accounts_details_posting_date: {
                    [Op.between]: [starting_date, closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });
        const get_credit_coa = async(coa_id, coa_accounts) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        model: chart_of_accounts_model,
                        association: accounts_details_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_details_subsidiary_ledger",
                            required:false
                        }),
                        where:{
                            chart_of_accounts_company: company,
                            chart_of_accounts_status: 1,
                            chart_of_accounts_delete_status: 0,
                        },
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status: 1,
                    accounts_details_delete_status: 0,
                    accounts_details_voucher_type: 2, //2 = Payment Voucher
                    accounts_details_general_ledger:{[Op.not]: coa_id},
                    accounts_details_accounts: coa_accounts,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const coa_data = await Promise.all(get_data.map(async (row) => ({
                accounts_details_id                 : row.accounts_details_id,
                accounts_details_accounts           : row.accounts_details_accounts,
                accounts_details_posting_date       : row.accounts_details_posting_date,
                accounts_details_voucher_type       : row.accounts_details_voucher_type,
                accounts_details_voucher_number     : row.accounts_details_voucher_number,
                chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                amount                              : row.accounts_details_debit
            })));

            return coa_data;
        };
        const credit_coa = await Promise.all(credit_coa_data.map(async (row) => ({
            data    : await get_credit_coa(row.chart_of_account.chart_of_accounts_id, row.accounts_details_accounts)
        })));

        const total_debit_amount_data   = parseFloat(cash_opening_balance) + debit_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.amount), 0), 0);
        const total_credit_amount_data  = parseFloat(cash_closing_balance) + credit_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.amount), 0), 0);

        const  total_debit_amount       = parseFloat(total_debit_amount_data).toFixed(2);
        const  total_credit_amount      = parseFloat(total_credit_amount_data).toFixed(2);

        return res.send({
            status: "1",
            message: "Cash Book Find Successfully!",
            data: {
                opening_balance         : cash_opening_balance,
                closing_balance         : cash_closing_balance,
                debit_coa               : debit_coa,
                credit_coa              : credit_coa,
                total_debit_amount      : total_debit_amount,
                total_credit_amount     : total_credit_amount,
                starting_closing_date   : {starting_date, closing_date},
                company                 : company_data,
                branch                  : branch_data
            }
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

// Bank Book
exports.bank_book = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const starting_date = new Date(req.query.starting_date);
        const closing_date  = new Date(req.query.closing_date);

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const opening_starting_date = new Date(accounts_data.accounts_details_posting_date);
        const opening_closing_date  = new Date (new Date(starting_date).getFullYear(), new Date(starting_date).getMonth(), new Date(starting_date).getDate()-1);

        const closing_starting_date = new Date(accounts_data.accounts_details_posting_date);
        const closing_closing_date  = new Date(req.query.closing_date);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const bank_coa = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company: company,
                chart_of_accounts_status: 1,
                chart_of_accounts_delete_status: 0,
                chart_of_accounts_link: 'cash_at_bank'
            },
            order: [
                ['chart_of_accounts_code', 'ASC']
            ]
        });

        const bank_opening_balance_data = await accounts_details_model.findOne({
            attributes: [
                ...[bank_coa.chart_of_accounts_accounts_type == 10000000?
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                    :
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ]
            ],
            where:{
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_general_ledger : bank_coa.chart_of_accounts_id,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0,
                accounts_details_posting_date: {
                    [Op.between]: [opening_starting_date, opening_closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });

        const bank_opening_balance = parseFloat(bank_opening_balance_data.dataValues.balance || 0).toFixed(2);


        const bank_closing_balance_data = await accounts_details_model.findOne({
            attributes: [
                ...[bank_coa.chart_of_accounts_accounts_type == 10000000?
                    [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
                    :
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ]
            ],
            where:{
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_general_ledger : bank_coa.chart_of_accounts_id,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0,
                accounts_details_posting_date: {
                    [Op.between]: [closing_starting_date, closing_closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });

        const bank_closing_balance = parseFloat(bank_closing_balance_data.dataValues.balance || 0).toFixed(2);

        const debit_coa_data = await accounts_details_model.findAll({
            attributes: ['accounts_details_id', 'accounts_details_accounts', 'accounts_details_debit', 'accounts_details_credit'],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_link'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0,
                    },
                    order:[
                        ['chart_of_accounts_code', 'ASC']
                    ]
                }
            ],
            where: {
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status: 1,
                accounts_details_delete_status: 0,
                accounts_details_voucher_type: 1, //1 = Receive Voucher
                accounts_details_general_ledger: bank_coa.chart_of_accounts_id,
                accounts_details_posting_date: {
                    [Op.between]: [starting_date, closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });
        const get_debit_coa = async(coa_id, coa_accounts) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        model: chart_of_accounts_model,
                        association: accounts_details_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_details_subsidiary_ledger",
                            required:false
                        }),
                        where:{
                            chart_of_accounts_company: company,
                            chart_of_accounts_status: 1,
                            chart_of_accounts_delete_status: 0,
                        },
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status: 1,
                    accounts_details_delete_status: 0,
                    accounts_details_voucher_type: 1, //1 = Receive Voucher
                    accounts_details_general_ledger:{[Op.not]: coa_id},
                    accounts_details_accounts: coa_accounts,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const coa_data = await Promise.all(get_data.map(async (row) => ({
                accounts_details_id                 : row.accounts_details_id,
                accounts_details_accounts           : row.accounts_details_accounts,
                accounts_details_posting_date       : row.accounts_details_posting_date,
                accounts_details_voucher_type       : row.accounts_details_voucher_type,
                accounts_details_voucher_number     : row.accounts_details_voucher_number,
                chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                amount                              : row.accounts_details_credit
            })));

            return coa_data;
        };
        const debit_coa = await Promise.all(debit_coa_data.map(async (row) => ({
            data    : await get_debit_coa(row.chart_of_account.chart_of_accounts_id, row.accounts_details_accounts)
        })));

        const credit_coa_data = await accounts_details_model.findAll({
            attributes: ['accounts_details_id', 'accounts_details_accounts', 'accounts_details_debit', 'accounts_details_credit'],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_link'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0,
                    },
                    order:[
                        ['chart_of_accounts_code', 'ASC']
                    ]
                }
            ],
            where: {
                accounts_details_company: company,
                ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                accounts_details_status: 1,
                accounts_details_delete_status: 0,
                accounts_details_voucher_type: 2, //2 = Payment Voucher
                accounts_details_general_ledger: bank_coa.chart_of_accounts_id,
                accounts_details_posting_date: {
                    [Op.between]: [starting_date, closing_date],
                },
            },
            order: [
                ['accounts_details_posting_date', 'ASC']
            ]
        });
        const get_credit_coa = async(coa_id, coa_accounts) => {
            const get_data = await accounts_details_model.findAll({
                include: [
                    {
                        model: chart_of_accounts_model,
                        association: accounts_details_model.hasOne(chart_of_accounts_model, {
                            foreignKey : 'chart_of_accounts_id',
                            sourceKey : "accounts_details_subsidiary_ledger",
                            required:false
                        }),
                        where:{
                            chart_of_accounts_company: company,
                            chart_of_accounts_status: 1,
                            chart_of_accounts_delete_status: 0,
                        },
                        order:[
                            ['chart_of_accounts_code', 'ASC']
                        ]
                    }
                ],
                where: {
                    accounts_details_company: company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status: 1,
                    accounts_details_delete_status: 0,
                    accounts_details_voucher_type: 2, //2 = Payment Voucher
                    accounts_details_general_ledger:{[Op.not]: coa_id},
                    accounts_details_accounts: coa_accounts,
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const coa_data = await Promise.all(get_data.map(async (row) => ({
                accounts_details_id                 : row.accounts_details_id,
                accounts_details_accounts           : row.accounts_details_accounts,
                accounts_details_posting_date       : row.accounts_details_posting_date,
                accounts_details_voucher_type       : row.accounts_details_voucher_type,
                accounts_details_voucher_number     : row.accounts_details_voucher_number,
                chart_of_accounts_id                : row.chart_of_account.chart_of_accounts_id,
                chart_of_accounts_code              : row.chart_of_account.chart_of_accounts_code,
                chart_of_accounts_name              : row.chart_of_account.chart_of_accounts_name,
                chart_of_accounts_accounts_category : row.chart_of_account.chart_of_accounts_accounts_category,
                chart_of_accounts_accounts_type     : row.chart_of_account.chart_of_accounts_accounts_type,
                chart_of_accounts_link              : row.chart_of_account.chart_of_accounts_link || '',
                amount                              : row.accounts_details_debit
            })));

            return coa_data;
        };
        const credit_coa = await Promise.all(credit_coa_data.map(async (row) => ({
            data    : await get_credit_coa(row.chart_of_account.chart_of_accounts_id, row.accounts_details_accounts)
        })));

        const total_debit_amount_data   = parseFloat(bank_opening_balance) + debit_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.amount), 0), 0);
        const total_credit_amount_data  = parseFloat(bank_closing_balance) + credit_coa.reduce((acc, item) => acc + item.data.reduce((acc, item) => acc + parseFloat(item.amount), 0), 0);

        const  total_debit_amount       = parseFloat(total_debit_amount_data).toFixed(2);
        const  total_credit_amount      = parseFloat(total_credit_amount_data).toFixed(2);

        return res.send({
            status: "1",
            message: "Bank Book Find Successfully!",
            data: {
                opening_balance         : bank_opening_balance,
                closing_balance         : bank_closing_balance,
                debit_coa               : debit_coa,
                credit_coa              : credit_coa,
                total_debit_amount      : total_debit_amount,
                total_credit_amount     : total_credit_amount,
                starting_closing_date   : {starting_date, closing_date},
                company                 : company_data,
                branch                  : branch_data,
            }
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

// Changes in Equity
exports.changes_in_equity = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;
        const closing_month = new Date(req.query.closing_month);

        const company_info = await company_model.findOne({
            where: {
                company_id: company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: branch
            }
        });
        let branch_data;
        if(!branch_info) {
            branch_data = {
                branch_code            : '',
                branch_name            : '',
                branch_phone           : '',
                branch_email           : '',
                branch_address         : '',
                branch_opening_date    : '',
            };
        } else {
            branch_data = {
                branch_code            : branch_info.branch_code,
                branch_name            : branch_info.branch_name,
                branch_phone           : branch_info.branch_phone,
                branch_email           : branch_info.branch_email,
                branch_address         : branch_info.branch_address,
                branch_opening_date    : branch_info.branch_opening_date,
            };
        }

        const financial_year = await financial_year_model.findOne({
            attributes: ['financial_year_starting_date', 'financial_year_closing_month'],
            where: {
                financial_year_company: company
            }
        });

        if(!financial_year) {
            return res.send({
                status: "0",
                message: "Financial Year Not Found!",
                data: "",
            });
        }

        const financial_year_starting_date  = financial_year.financial_year_starting_date;
        const financial_year_closing_month   = financial_year.financial_year_closing_month;

        const accounts_data = await accounts_details_model.findOne({
            attributes: ['accounts_details_posting_date'],
            where: {
                accounts_details_company: company
            }
        });

        const starting_date = new Date(accounts_data.accounts_details_posting_date) || new Date();
        let current_month_opening_closing_date      = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);
        let last_month_opening_closing_date         = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()-1, 0);

        let current_year_opening_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_opening_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_opening_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_opening_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_opening_closing_date = new Date(new Date(closing_month).getFullYear()-2, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_opening_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let current_month_start_date    = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 2);
        let current_month_closing_date  = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()+1, 0);
        let last_month_start_date       = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth()-1, 2);
        let last_month_closing_date     = new Date(new Date(closing_month).getFullYear(), new Date(closing_month).getMonth(), 0);

        let current_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            current_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            current_year_start_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_starting_date).getMonth(), 2);
        }

        let current_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            current_year_closing_date = new Date(new Date(closing_month).getFullYear()+1, new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        let last_year_start_date;
        if(financial_year_starting_date >= new Date(closing_month.getMonth()+1)) {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-2, new Date(financial_year_starting_date).getMonth(), 2);
        } else {
            last_year_start_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_starting_date).getMonth(), 2);
        }

        let last_year_closing_date;
        if(financial_year_closing_month >= new Date(closing_month.getMonth()+1)) {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear()-1, new Date(financial_year_closing_month).getMonth()+1, 0);
        } else {
            last_year_closing_date = new Date(new Date(closing_month).getFullYear(), new Date(financial_year_closing_month).getMonth()+1, 0);
        }

        const get_opening_balance = async() => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, current_month_opening_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, last_month_opening_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, current_year_opening_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [starting_date, last_year_opening_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const get_surplus_deficit = async() => {
            const current_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [current_month_start_date, current_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_month_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [last_month_start_date, last_month_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [current_year_start_date, current_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const last_year_data = await accounts_details_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(accounts_details_credit) - SUM(accounts_details_debit))'),'balance']
                ],
                where:{
                    accounts_details_company        : company,
                    ...(branch == 'all' ?{}:{ accounts_details_branch : branch}),
                    accounts_details_status         : 1,
                    accounts_details_delete_status  : 0,
                    [Op.or]: [
                        {
                            accounts_details_accounts_type: 30000000
                        },
                        {
                            accounts_details_accounts_type:40000000
                        }
                    ],
                    accounts_details_posting_date: {
                        [Op.between]: [last_year_start_date, last_year_closing_date],
                    },
                },
                order: [
                    ['accounts_details_posting_date', 'ASC']
                ]
            });

            const current_month_balance = current_month_data.dataValues.balance || 0;
            const last_month_balance = last_month_data.dataValues.balance || 0;
            const current_year_balance = current_year_data.dataValues.balance || 0;
            const last_year_balance = last_year_data.dataValues.balance || 0;

            const balance = {
                current_month_balance   : current_month_balance,
                last_month_balance      : last_month_balance,
                current_year_balance    : current_year_balance,
                last_year_balance       : last_year_balance,
            }
            return balance;
        };

        const opening_balance = await get_opening_balance();
        const surplus_deficit = await get_surplus_deficit();

        const get_total_balance = {
            current_month_balance: (parseFloat(opening_balance.current_month_balance)+parseFloat(surplus_deficit.current_month_balance)).toFixed(2),
            last_month_balance: (parseFloat(opening_balance.last_month_balance)+parseFloat(surplus_deficit.last_month_balance)).toFixed(2),
            current_year_balance: (parseFloat(opening_balance.current_year_balance)+parseFloat(surplus_deficit.current_year_balance)).toFixed(2),
            last_year_balance: (parseFloat(opening_balance.last_year_balance)+parseFloat(surplus_deficit.last_year_balance)).toFixed(2),
        }

        return res.send({
            status: "1",
            message: "Income Expenditure Find Successfully!",
            data: {
                opening_balance : opening_balance,
                surplus_deficit : surplus_deficit,
                total_balance   : get_total_balance,
                closing_month_year: {
                    current_month_opening_closing_date, last_month_opening_closing_date,current_year_opening_closing_date,last_year_opening_closing_date,
                    current_month_start_date, current_month_closing_date, last_month_start_date, last_month_closing_date, current_year_start_date, current_year_closing_date, last_year_start_date, last_year_closing_date
                },
                company: company_data,
                branch: branch_data,
                financial_year: financial_year
            }
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

// Cash Balance Company
exports.cash_balance_company = async (req, res) => {
    try {
        const company       = req.params.company;

        const get_cash_balance = await accounts_details_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
            ],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_link: 'cash_in_hand'
                    }
                }
            ],
            where:{
                accounts_details_company        : company,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0
            },
            order: [
                ['accounts_details_id', 'ASC']
            ]
        });

        const cash_balance = get_cash_balance.dataValues.balance || 0;

        return res.send({
            status: "1",
            message: "Cash Balance for Company Find Successfully!",
            data: cash_balance
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

// Cash Balance Branch
exports.cash_balance_branch = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;

        const get_cash_balance = await accounts_details_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
            ],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_link: 'cash_in_hand'
                    }
                }
            ],
            where:{
                accounts_details_company        : company,
                accounts_details_branch         : branch,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0
            },
            order: [
                ['accounts_details_id', 'ASC']
            ]
        });

        const cash_balance = get_cash_balance.dataValues.balance || 0;

        return res.send({
            status: "1",
            message: "Cash Balance for Branch Find Successfully!",
            data: cash_balance
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

// Bank Balance Company
exports.bank_balance_company = async (req, res) => {
    try {
        const company       = req.params.company;

        const get_cash_balance = await accounts_details_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
            ],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_link: 'cash_at_bank'
                    }
                }
            ],
            where:{
                accounts_details_company        : company,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0
            },
            order: [
                ['accounts_details_id', 'ASC']
            ]
        });

        const cash_balance = get_cash_balance.dataValues.balance || 0;

        return res.send({
            status: "1",
            message: "Bank Balance for Company Find Successfully!",
            data: cash_balance
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

// Cash Balance Branch
exports.bank_balance_branch = async (req, res) => {
    try {
        const company       = req.query.company;
        const branch        = req.query.branch;

        const get_cash_balance = await accounts_details_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(accounts_details_debit) - SUM(accounts_details_credit))'),'balance']
            ],
            include: [
                {
                    model: chart_of_accounts_model,
                    attributes: ['chart_of_accounts_id', 'chart_of_accounts_code', 'chart_of_accounts_name'],
                    association: accounts_details_model.hasOne(chart_of_accounts_model, {
                        foreignKey : 'chart_of_accounts_id',
                        sourceKey : "accounts_details_general_ledger",
                        required:false
                    }),
                    where:{
                        chart_of_accounts_company: company,
                        chart_of_accounts_link: 'cash_at_bank'
                    }
                }
            ],
            where:{
                accounts_details_company        : company,
                accounts_details_branch         : branch,
                accounts_details_status         : 1,
                accounts_details_delete_status  : 0
            },
            order: [
                ['accounts_details_id', 'ASC']
            ]
        });

        const cash_balance = get_cash_balance.dataValues.balance || 0;

        return res.send({
            status: "1",
            message: "Bank Balance for Branch Find Successfully!",
            data: cash_balance
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

