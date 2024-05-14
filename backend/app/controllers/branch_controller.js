require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const company_model         = db.company_model;
const branch_model          = db.branch_model;
const user_model            = db.user_model;

const Op                    = db.Sequelize.Op;
let user_id;

// Branch List
exports.branch_list = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const login_user_data = await user_model.findOne({
            where: {
                user_id: user_id
            }
        });
        const data = await branch_model.findAll({
            include: [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: branch_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "branch_company",
                        required:false
                    })
                }
            ],
            where: {
                ...(login_user_data.user_user_group == 1 ?{}:(login_user_data.user_user_group == 2)?{}:(login_user_data.user_user_group == 3)?{
                    branch_company : login_user_data.user_company
                }:{
                    branch_company : login_user_data.user_company,
                    branch_id       : 1,
                }),

                branch_company : req.query.company,

                ...(req.query.status == 'all' ?{}:{
                    branch_status : req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        branch_name: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        branch_owner_name:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        branch_phone:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        branch_email:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        branch_website:{[Op.like]: `%${req.query.search}%`}
                    }
                ]}:{}),
                branch_delete_status: 0
            }
        });

        if(data.length > 0) {
            const branch_data = await Promise.all(data.map(async (row) => ({
                branch_id          : row.branch_id ,
                branch_company     : row.branch_company ,
                branch_company_name: row.company === null ? '' : row.company.company_name,
                branch_code        : row.branch_code,
                branch_name        : row.branch_name,
                branch_phone       : row.branch_phone,
                branch_email       : row.branch_email,
                branch_address     : row.branch_address,
                branch_opening_date: row.branch_opening_date,
                branch_status      : row.branch_status,
                branch_create_at   : row.branch_create_at,
                branch_update_at   : row.branch_update_at
            })));

            return res.send({
                status: "1",
                message: "Branch Data Found Successfully!",
                data: branch_data,
            });
        }

        return res.send({
            status: "0",
            message: "Branch Data Not Found!",
            data: [],
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Branch List Active
exports.branch_list_active = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const login_user_data = await user_model.findOne({
            where: {
                user_id: user_id
            }
        });
        const user_user_group =  login_user_data.user_user_group;

        const data = await branch_model.findAll({
            include: [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: branch_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "branch_company",
                        required:false
                    })
                }
            ],
            where: {
                ...(login_user_data.user_user_group == 1 ?{}:(login_user_data.user_user_group == 2)?{}:(login_user_data.user_user_group == 3)?{
                    branch_company : login_user_data.user_company
                }:{
                    branch_id : login_user_data.user_branch,
                }),
                branch_company : req.params.company,
                branch_status: 1,
                branch_delete_status: 0
            }
        });

        if(data.length > 0) {
            const branch_data = await Promise.all(data.map(async (row) => ({
                branch_id          : row.branch_id ,
                branch_company     : row.branch_company ,
                branch_company_name: row.company === null ? '' : row.company.company_name,
                branch_code        : row.branch_code,
                branch_name        : row.branch_name,
                branch_phone       : row.branch_phone,
                branch_email       : row.branch_email,
                branch_address     : row.branch_address,
                branch_opening_date: row.branch_opening_date,
                branch_status      : row.branch_status,
                branch_create_at   : row.branch_create_at,
                branch_update_at   : row.branch_update_at
            })));

            return res.send({
                status: "1",
                message: "Branch Data Found Successfully!",
                data: branch_data,
            });
        }

        return res.send({
            status: "0",
            message: "Branch Data Not Found!",
            data: [],
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Branch Company
exports.get_branch_company = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const login_user_data = await user_model.findOne({
            where: {
                user_id: user_id
            }
        });
        const user_user_group =  login_user_data.user_user_group;
        const data = await branch_model.findAll({
            include: [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: branch_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "branch_company",
                        required:false
                    })
                }
            ],
            where: {
                ...(login_user_data.user_user_group == 1 || login_user_data.user_user_group == 2 || login_user_data.user_user_group == 3?{
                    branch_company : req.params.company_id
                }:{
                    branch_id : login_user_data.user_branch,
                }),
                branch_status: 1,
                branch_delete_status: 0
            }
        });

        const company_data = await company_model.findOne({
            where: {
                company_id: req.params.company_id
            }
        });

        if(!company_data) {
            return res.send({
                status: "0",
                message: "Company ID Not Found!",
                data: [],
                company: "",
            });
        }
        
        if(data.length > 0) {
            const branch_data = await Promise.all(data.map(async (row) => ({
                branch_id          : row.branch_id ,
                branch_company     : row.branch_company ,
                branch_company_name: row.company === null ? '' : row.company.company_name,
                branch_code        : row.branch_code,
                branch_name        : row.branch_name,
                branch_phone       : row.branch_phone,
                branch_email       : row.branch_email,
                branch_address     : row.branch_address,
                branch_opening_date: row.branch_opening_date,
                branch_status      : row.branch_status,
                branch_create_at   : row.branch_create_at,
                branch_update_at   : row.branch_update_at
            })));

            return res.send({
                status: "1",
                message: "Branch Data Found Successfully!",
                data: branch_data,
                company:{
                    company_id:company_data.company_id,
                    company_name:company_data.company_name,
                    company_owner_name:company_data.company_owner_name,
                    company_phone:company_data.company_phone,
                    company_email:company_data.company_email,
                    company_address:company_data.company_address,
                }
            });
        }
        
        return res.send({
            status: "0",
            message: "Branch Data Not Found!",
            data: [],
            company:{
                company_id:company_data.company_id,
                company_name:company_data.company_name,
                company_owner_name:company_data.company_owner_name,
                company_phone:company_data.company_phone,
                company_email:company_data.company_email,
                company_address:company_data.company_address,
            }
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: [],
            company: "",
        });
    }
};

// Get Branch
exports.get_branch = async (req, res) => {
    try {
        const data = await branch_model.findOne({
            include: [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: branch_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "branch_company",
                        required:false
                    })
                }
            ],
            where: {
                branch_id: req.params.branch_id
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Branch Data Not Found!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Branch Data Found Successfully!",
            data: {
                branch_id          : data.branch_id ,
                branch_company     : data.branch_company ,
                branch_company_name: data.company === null ? '' : data.company.company_name,
                branch_code        : data.branch_code,
                branch_name        : data.branch_name,
                branch_phone       : data.branch_phone,
                branch_email       : data.branch_email,
                branch_address     : data.branch_address,
                branch_opening_date: data.branch_opening_date,
                branch_status      : data.branch_status,
                branch_create_at   : data.branch_create_at,
                branch_update_at   : data.branch_update_at
            },
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Branch Create
exports.branch_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const data = await branch_model.create({
            branch_company     : req.body.branch_company,
            branch_code        : req.body.branch_code,
            branch_name        : req.body.branch_name,
            branch_phone       : req.body.branch_phone,
            branch_email       : req.body.branch_email,
            branch_address     : req.body.branch_address,
            branch_opening_date: req.body.branch_opening_date,
            branch_create_by   : user_id
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Branch Create Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Branch Create Successfully!",
            data: "",
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Branch Update
exports.branch_update = async (req, res) => {
    try {
        const branch = await branch_model.findOne({
            where: {
                branch_id: req.params.branch_id
            }
        });

        if(!branch) {
            return res.send({
                status: "0",
                message: "Branch ID Not Found!",
                data: "",
            });
        }

        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const data = await branch_model.update({
            branch_company     : req.body.branch_company,
            branch_code        : req.body.branch_code,
            branch_name        : req.body.branch_name,
            branch_phone       : req.body.branch_phone,
            branch_email       : req.body.branch_email,
            branch_address     : req.body.branch_address,
            branch_opening_date: req.body.branch_opening_date,
            branch_status      : req.body.branch_status,
            branch_update_by   : user_id
        },
        {
            where: {
                branch_id : req.params.branch_id
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Branch Update Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Branch Update Successfully!",
            data: "",
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Branch Delete
exports.branch_delete = async (req, res) => {
    try {
        const branch = await branch_model.findOne({
            where: {
                branch_id: req.params.branch_id
            }
        });

        if(!branch) {
            return res.send({
                status: "0",
                message: "Branch ID Not Found!",
                data: "",
            });
        }

        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const data = await branch_model.update({
            branch_status          : 0,
            branch_delete_status   : 1,
            branch_delete_by       : user_id
        },
        {
            where: {
                branch_id : req.params.branch_id
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Branch Delete Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Branch Delete Successfully!",
            data: "",
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Branch Count
exports.branch_count = async (req, res) => {
    try {
        const data = await branch_model.count({
            where: {
                branch_status: 1,
                branch_delete_status: 0,
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Branch Count Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Branch Count Successfully!",
            data: data,
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Branch Count Company
exports.branch_count_company = async (req, res) => {
    try {
        const data = await branch_model.count({
            where: {
                branch_company: req.params.company,
                branch_status: 1,
                branch_delete_status: 0,
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Branch Count Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Branch Count Successfully!",
            data: data,
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};