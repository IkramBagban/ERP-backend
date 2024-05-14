require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const user_model            = db.user_model;
const user_group_model      = db.user_group_model;
const company_model         = db.company_model;
const branch_model          = db.branch_model;
const reset_password_model  = db.reset_password_model;
const status_model          = db.status_model;

const Op                    = db.Sequelize.Op;
let user_id;

// User Register
exports.user_register = async (req, res) => {
    // User ID generate date
    const u_id_date = new Date();

    try {
        const user = await user_model.create({
            user_name           : req.body.user_name,
            username            : req.body.username,
            password            : bcrypt.hashSync(req.body.password, 10),
            password_show       : req.body.password,
            user_designation    : req.body.user_designation,
            user_phone          : req.body.user_phone,
            user_email          : req.body.user_email,
            user_address        : req.body.user_address,
            user_company        : req.body.user_company,
            user_branch         : req.body.user_branch,
            user_user_group     : req.body.user_group,
            user_picture        : 'assets/images/users/user-icon.png',
            user_language       : 'en',
            user_theme          : 'blue'
        });

        if(!user) {
            return res.send({
                status: "0",
                message: "User Register Failed!",
                data: "",
            });
        }

        const user_id_number    = u_id_date.getFullYear().toString().substr(-2)+""+(u_id_date.getMonth()+1).toString().padStart(2, '0')+""+user.user_id.toString().padStart(6, '0');

        const user_update = await user_model.update(
            {
                user_id_number  : user_id_number
            },
            {
                where:{
                    user_id: user.user_id
                }
            }
        );

        return res.send({
            status: "1",
            message: "User Successfully Registered!",
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

// User Login
exports.user_login = async (req, res) => {
    try {
        const user = await user_model.findOne({
            include: [
                {
                    model: user_group_model,
                    attributes: ['user_group_id', 'user_group_name'],
                    association: user_model.hasOne(user_group_model, {
                        foreignKey : 'user_group_id',
                        sourceKey : "user_user_group",
                        required:false
                    })
                },
                {
                    model: company_model,
                    attributes: ['company_id', 'company_name'],
                    association: user_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "user_company",
                        required:false
                    })
                },
                {
                    model: branch_model,
                    attributes: ['branch_id', 'branch_code', 'branch_name'],
                    association: user_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "user_branch",
                        required:false
                    })
                },
                {
                    model: status_model,
                    attributes: ['status_id', 'status_code', 'status_name'],
                    association: user_model.hasOne(status_model, {
                        foreignKey : 'status_id',
                        sourceKey : "user_status",
                        required:false
                    })
                }
            ],
            where: {
                [Op.or]: [
                    {
                        user_id_number: req.body.username
                    },
                    {
                        username: req.body.username
                    },
                    {
                        user_phone: req.body.username
                    },
                    {
                        user_email: req.body.username
                    },
                ],
                user_status: 1
            }
        });

        if (!user) {
            return res.send({
                status: "0",
                message: "Username or Phone or Email Invalid",
                data:"",
            });
        }

        const password_is_valid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!password_is_valid) {
                return res.send({
                status  : "0",
                message : "Your Password Invalid",
                data    : "",
            });
        }

        const token = jwt.sign({ user_id: user.user_id}, config.secret, {
            expiresIn: process.env.TOKEN_EXPIRE_TIME
        });

        return res.send({
            status  : "1",
            message : "You have Successfully Login!",
            data    : {
                user_id             : user.user_id,
                user_id_number      : user.user_id_number,
                user_name           : user.user_name,
                username            : user.username,
                user_designation    : user.user_designation,
                user_phone          : user.user_phone,
                user_email          : user.user_email,
                user_address        : user.user_address,
                user_picture        : user.user_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${user.user_picture}`,
                user_language       : user.user_language,
                user_theme          : user.user_theme,
                user_company        : user.user_company,
                user_branch         : user.user_branch,
                user_group          : user.user_user_group,
                user_group_name     : user.user_group === null ? '' : user.user_group.user_group_name
            },
            token   : token,
        });
    } catch (error) {
        return res.send({
            status  : "0",
            message : error.message,
            data    : "",
        });
    }
};

//Logout
exports.user_logout = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        const logout = jwt.verify(token, config.secret, {
            expiresIn: Date.now(),
        });

        // jwt.sign({ user_id: req.params.user_id}, config.secret, {
        //     expiresIn: Date.now(),
        // });
        if(!logout) {
            return res.send({
                status: "0",
                message: "Logout Error!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "You have Logout!",
            data: "",
        });
    } catch (error) {
        return res.send({
            status  : "0",
            message : error.message,
            data    : "",
        });
    }
};

// User List
exports.user_list = async (req, res) => {
    try {
        const data = await user_model.findAll({
            include: [
                {
                    model: user_group_model,
                    attributes: ['user_group_id', 'user_group_name'],
                    association: user_model.hasOne(user_group_model, {
                        foreignKey : 'user_group_id',
                        sourceKey : "user_user_group",
                        required:false
                    })
                },
                {
                    model: company_model,
                    attributes: ['company_id', 'company_name'],
                    association: user_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "user_company",
                        required:false
                    })
                },
                {
                    model: branch_model,
                    attributes: ['branch_id', 'branch_code', 'branch_name'],
                    association: user_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "user_branch",
                        required:false
                    })
                },
                {
                    model: status_model,
                    attributes: ['status_id', 'status_code', 'status_name'],
                    association: user_model.hasOne(status_model, {
                        foreignKey : 'status_id',
                        sourceKey : "user_status",
                        required:false
                    })
                }
            ],
            where: {
                user_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    user_branch : req.query.branch
                }),
                ...(req.query.status == 'all' ?{}:{
                    user_status : req.query.status
                }),
                user_delete_status: 0
            }
        });

        if(data.length > 0){
            const user_data = await Promise.all(data.map(async (row) => ({
                user_id             : row.user_id,
                user_id_number      : row.user_id_number,
                user_name           : row.user_name,
                username            : row.username,
                user_designation    : row.user_designation,
                user_phone          : row.user_phone,
                user_email          : row.user_email,
                user_address        : row.user_address,
                user_picture        : row.user_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${row.user_picture}`,
                user_language       : row.user_language,
                user_theme          : row.user_theme,
                user_group_name     : row.user_group === null ? '' : row.user_group.user_group_name,
                user_company        : row.user_company,
                user_company_name   : row.company === null ? '' : row.company.company_name,
                user_branch         : row.user_branch,
                user_branch_code    : row.branch === null ? '' : row.branch.branch_code,
                user_branch_name    : row.branch === null ? '' : row.branch.branch_name,
                user_group          : row.user_user_group,
                user_group_name     : row.user_group === null ? '' : row.user_group.user_group_name,
                user_status         : row.user_status,
                user_status_name    : row.status === null ? '' : row.status.status_name,
                user_delete_status  : row.user_delete_status,
                user_create_at      : row.user_create_at,
                user_update_at      : row.user_update_at
            })));

            return res.send({
                status  : "1",
                message : "Users Found Successfully!",
                data    : user_data
            });
        } else {
            return res.send({
                status  : "0",
                message : "Users Not Found!",
                data    : [],
            });
        }
    } catch (error) {
        res.send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// User List Active
exports.user_list_active = async (req, res) => {
    try {
        const data = await user_model.findAll({
            include: [
                {
                    model: user_group_model,
                    attributes: ['user_group_id', 'user_group_name'],
                    association: user_model.hasOne(user_group_model, {
                        foreignKey : 'user_group_id',
                        sourceKey : "user_user_group",
                        required:false
                    })
                },
                {
                    model: company_model,
                    attributes: ['company_id', 'company_name'],
                    association: user_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "user_company",
                        required:false
                    })
                },
                {
                    model: branch_model,
                    attributes: ['branch_id', 'branch_code', 'branch_name'],
                    association: user_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "user_branch",
                        required:false
                    })
                },
                {
                    model: status_model,
                    attributes: ['status_id', 'status_code', 'status_name'],
                    association: user_model.hasOne(status_model, {
                        foreignKey : 'status_id',
                        sourceKey : "user_status",
                        required:false
                    })
                }
            ],
            where: {
                ...(req.query.company == 'all' ?{}:{
                    user_company: req.query.company
                }),
                ...(req.query.branch == 'all' ?{}:{
                    user_branch : req.query.branch
                }),
                user_status: 1,
                user_delete_status: 0
            }
        });

        if(data.length > 0){
            const user_data = await Promise.all(data.map(async (row) => ({
                user_id             : row.user_id,
                user_id_number      : row.user_id_number,
                user_name           : row.user_name,
                username            : row.username,
                user_designation    : row.user_designation,
                user_phone          : row.user_phone,
                user_email          : row.user_email,
                user_address        : row.user_address,
                user_picture        : row.user_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${row.user_picture}`,
                user_language       : row.user_language,
                user_theme          : row.user_theme,
                user_group_name     : row.user_group === null ? '' : row.user_group.user_group_name,
                user_company        : row.user_company,
                user_company_name   : row.company === null ? '' : row.company.company_name,
                user_branch         : row.user_branch,
                user_branch_code    : row.branch === null ? '' : row.branch.branch_code,
                user_branch_name    : row.branch === null ? '' : row.branch.branch_name,
                user_group          : row.user_user_group,
                user_group_name     : row.user_group === null ? '' : row.user_group.user_group_name,
                user_status         : row.user_status,
                user_status_name    : row.status === null ? '' : row.status.status_name,
                user_delete_status  : row.user_delete_status,
                user_create_at      : row.user_create_at,
                user_update_at      : row.user_update_at
            })));

            return res.send({
                status  : "1",
                message : "Users Found Successfully!",
                data    : user_data
            });
        } else {
            return res.send({
                status  : "0",
                message : "Users Not Found!",
                data    : [],
            });
        }
    } catch (error) {
        res.send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// Get User
exports.get_user = async (req, res) => {
    try {

        const user = await user_model.findOne({
            include: [
                {
                    model: user_group_model,
                    attributes: ['user_group_id', 'user_group_name'],
                    association: user_model.hasOne(user_group_model, {
                        foreignKey : 'user_group_id',
                        sourceKey : "user_user_group",
                        required:false
                    })
                },
                {
                    model: company_model,
                    attributes: ['company_id', 'company_name'],
                    association: user_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "user_company",
                        required:false
                    })
                },
                {
                    model: branch_model,
                    attributes: ['branch_id', 'branch_code', 'branch_name'],
                    association: user_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "user_branch",
                        required:false
                    })
                },
                {
                    model: status_model,
                    attributes: ['status_id', 'status_code', 'status_name'],
                    association: user_model.hasOne(status_model, {
                        foreignKey : 'status_id',
                        sourceKey : "user_status",
                        required:false
                    })
                }
            ],
            where: {
                user_id: req.params.user_id
            }
        });

        if(!user) {
            return res.send({
                status  : "0",
                message : "User ID Not Found!",
                data    : "",
            });
        }

        return res.send({
            status  : "1",
            message : "User Find Successfully!",
            data    : {
                user_id             : user.user_id,
                user_id_number      : user.user_id_number,
                user_name           : user.user_name,
                username            : user.username,
                user_designation    : user.user_designation,
                user_phone          : user.user_phone,
                user_email          : user.user_email,
                user_address        : user.user_address,
                user_picture        : user.user_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${user.user_picture}`,
                user_language       : user.user_language,
                user_theme          : user.user_theme,
                user_group_name     : user.user_group === null ? '' : user.user_group.user_group_name,
                user_company        : user.user_company,
                user_company_name   : user.company === null ? '' : user.company.company_name,
                user_branch         : user.user_branch,
                user_branch_code    : user.branch === null ? '' : user.branch.branch_code,
                user_branch_name    : user.branch === null ? '' : user.branch.branch_name,
                user_group          : user.user_user_group,
                user_group_name     : user.user_group === null ? '' : user.user_group.user_group_name,
                user_status         : user.user_status,
                user_status_name    : user.status === null ? '' : user.status.status_name,
                user_delete_status  : user.user_delete_status,
                user_create_at      : user.user_create_at,
                user_update_at      : user.user_update_at
            }
        });
    } catch (error) {
        res.send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// User Update
exports.user_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data) {
            return res.send({
                status  : "0",
                message : "User ID Not Found!",
                data    : "",
            });
        }

        const user_update = await user_model.update(
            {
                user_name           : req.body.user_name,
                user_designation    : req.body.user_designation,
                user_phone          : req.body.user_phone,
                user_email          : req.body.user_email,
                user_address        : req.body.user_address,
                user_company        : req.body.user_company,
                user_branch         : req.body.user_branch,
                user_user_group     : req.body.user_group,
                user_status         : req.body.user_status,
                user_update_by      : user_id,
            },
            {
                where: {
                    user_id: req.params.user_id
                }
            }
        );

        const user = await user_model.findOne({
            include: [
                {
                    model: user_group_model,
                    attributes: ['user_group_id', 'user_group_name'],
                    association: user_model.hasOne(user_group_model, {
                        foreignKey : 'user_group_id',
                        sourceKey : "user_user_group",
                        required:false
                    })
                },
                {
                    model: company_model,
                    attributes: ['company_id', 'company_name'],
                    association: user_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "user_company",
                        required:false
                    })
                },
                {
                    model: branch_model,
                    attributes: ['branch_id', 'branch_code', 'branch_name'],
                    association: user_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "user_branch",
                        required:false
                    })
                },
                {
                    model: status_model,
                    attributes: ['status_id', 'status_code', 'status_name'],
                    association: user_model.hasOne(status_model, {
                        foreignKey : 'status_id',
                        sourceKey : "user_status",
                        required:false
                    })
                }
            ],
            where: {
                user_id: data.user_id
            }
        });

        return res.send({
            status  : "1",
            message : "Users Update Successfully!",
            data    : {
                user_id             : user.user_id,
                user_id_number      : user.user_id_number,
                user_name           : user.user_name,
                username            : user.username,
                user_phone          : user.user_phone,
                user_email          : user.user_email,
                user_address        : user.user_address,
                user_picture        : user.user_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${user.user_picture}`,
                user_language       : user.user_language,
                user_theme          : user.user_theme,
                user_group_name     : user.user_group === null ? '' : user.user_group.user_group_name,
                user_company        : user.user_company,
                user_company_name   : user.company === null ? '' : user.company.company_name,
                user_branch         : user.user_branch,
                user_branch_code    : user.branch === null ? '' : user.branch.branch_code,
                user_branch_name    : user.branch === null ? '' : user.branch.branch_name,
                user_group          : user.user_user_group,
                user_group_name     : user.user_group === null ? '' : user.user_group.user_group_name,
                user_status         : user.user_status,
                user_status_name    : user.status === null ? '' : user.status.status_name,
                user_delete_status  : user.user_delete_status,
                user_create_at      : user.user_create_at,
                user_update_at      : user.user_update_at
            }
        });
    } catch (error) {
        res.send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// Profile Update
exports.profile_update = async (req, res) => {
    try {
        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data) {
            return res.send({
                status  : "0",
                message : "User ID Not Found!",
                data    : "",
            });
        }

        const user_update = await user_model.update(
            {
                user_name           : req.body.user_name,
                user_designation    : req.body.user_designation,
                user_phone          : req.body.user_phone,
                user_email          : req.body.user_email,
                user_address        : req.body.user_address
            },
            {
                where: {
                    user_id: req.params.user_id
                }
            }
        );

        const user = await user_model.findOne({
            include: [
                {
                    model: user_group_model,
                    attributes: ['user_group_id', 'user_group_name'],
                    association: user_model.hasOne(user_group_model, {
                        foreignKey : 'user_group_id',
                        sourceKey : "user_user_group",
                        required:false
                    })
                },
                {
                    model: company_model,
                    attributes: ['company_id', 'company_name'],
                    association: user_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "user_company",
                        required:false
                    })
                },
                {
                    model: branch_model,
                    attributes: ['branch_id', 'branch_code', 'branch_name'],
                    association: user_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "user_branch",
                        required:false
                    })
                },
                {
                    model: status_model,
                    attributes: ['status_id', 'status_code', 'status_name'],
                    association: user_model.hasOne(status_model, {
                        foreignKey : 'status_id',
                        sourceKey : "user_status",
                        required:false
                    })
                }
            ],
            where: {
                user_id: req.params.user_id
            }
        });

        return res.send({
            status  : "1",
            message : "Profile Update Successfully!",
            data    : {
                user_id             : user.user_id,
                user_id_number      : user.user_id_number,
                user_name           : user.user_name,
                username            : user.username,
                user_designation    : user.user_designation,
                user_phone          : user.user_phone,
                user_email          : user.user_email,
                user_address        : user.user_address,
                user_picture        : user.user_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${user.user_picture}`,
                user_language       : user.user_language,
                user_theme          : user.user_theme,
                user_group_name     : user.user_group === null ? '' : user.user_group.user_group_name,
                user_company        : user.user_company,
                user_company_name   : user.company === null ? '' : user.company.company_name,
                user_branch         : user.user_branch,
                user_branch_code    : user.branch === null ? '' : user.branch.branch_code,
                user_branch_name    : user.branch === null ? '' : user.branch.branch_name,
                user_group          : user.user_user_group,
                user_group_name     : user.user_group === null ? '' : user.user_group.user_group_name,
                user_status         : user.user_status,
                user_status_name    : user.status === null ? '' : user.status.status_name,
                user_delete_status  : user.user_delete_status,
                user_create_at      : user.user_create_at,
                user_update_at      : user.user_update_at
            }
        });
    } catch (error) {
        res.send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// Reset Password Verify
exports.reset_password_verify = async (req, res) => {
    try {
        const data = await user_model.findOne({
            where: {
                [Op.or]: [
                    {
                        user_phone: req.body.phone_email
                    },
                    {
                        user_email: req.body.phone_email
                    },
                ],
                user_status: 1
            }
        });

        if(!data){
            return res.send({
                status: "0",
                message: "Phone or E-mail Does Not Matched!",
                data: "",
            });
        }

        return res.send({
            status  : "1",
            message : "Phone or E-mail Verify Successfully!",
            data    : {
                user_id     : data.user_id,
                user_phone  : data.user_phone,
                user_email  : data.user_email
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

// Reset Password
exports.reset_password = async (req, res) => {
    try {
        const password      = req.body.password;
        const c_password    = req.body.c_password;

        if(password != c_password) {
            return res.send({
                status: "0",
                message: "Password Does Not Matched!",
                data: {
                    user_id     : req.params.user_id,
                    phone_email : req.body.phone_email,
                    password    : req.body.password,
                    c_password  : req.body.c_password,
                },
            });
        }

        const data = await user_model.findOne({
            where: {
                [Op.or]: [
                    {
                        user_phone: req.body.phone_email
                    },
                    {
                        user_email: req.body.phone_email
                    },
                ],
                user_status: 1
            }
        });

        if(!data){
            return res.send({
                status: "0",
                message: "Phone or E-mail Does Not Matched!",
                data: "",
            });
        }

        const user_update = await user_model.update(
            {
                password        : bcrypt.hashSync(req.body.password, 10),
                password_show   : req.body.password,
            },
            {
                where:{
                    user_id     : req.params.user_id
                }
            }
        );

        return res.send({
            status  : "1",
            message : "Password Reset Successfully!",
            data    : {
                user_id     : req.params.user_id,
                password    : req.body.password
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

// Change Password
exports.change_password = async (req, res) => {
    try {
        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data){
            return res.send({
                status: "0",
                message: "User Not Found!",
                data: "",
            });
        }

        const current_password = req.body.current_password;
        if(current_password != data.password_show) {
            return res.send({
                status: "0",
                message: "Current Password Does Not Matched",
                data: "",
            });
        }

        const password = req.body.password;
        const c_password = req.body.c_password;

        if(password != c_password) {
            return res.send({
                status: "0",
                message: "Password Does Not Matched!",
                data: {
                    user_id     : req.params.user_id,
                    password    : req.body.password,
                    c_password  : req.body.c_password,
                },
            });
        }

        const user_update = await user_model.update(
            {
                password        : bcrypt.hashSync(req.body.password, 10),
                password_show   : req.body.password,
            },
            {
                where:{
                    user_id     : req.params.user_id
                }
            }
        );

        return res.send({
            status  : "1",
            message : "Password Reset Successfully!",
            data    : {
                user_id     : req.params.user_id,
                password    : req.body.password
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

// Change Profile Picture
exports.change_profile_picture = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let user_picture;
        if (req.file == undefined) {
            user_picture = req.body.user_picture_old;
        } else {
            user_picture = "assets/images/users/"+req.file.filename;
        }

        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data){
            return res.send({
                status: "0",
                message: "User Not Found!",
                data: "",
            });
        }

        const user_update = await user_model.update(
            {
                user_picture    : user_picture,
                user_update_by  : user_id,
            },
            {
                where:{
                    user_id     : req.params.user_id
                }
            }
        );

        return res.send({
            status  : "1",
            message : "Profile Picture Change Successfully!",
            data    : ''
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

// User Delete
exports.user_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const data = await user_model.findOne({
            where: {
                user_id: req.params.user_id
            }
        });

        if(!data) {
            return res.send({
                status  : "0",
                message : "User ID Not Found!",
                data    : "",
            });
        }

        const user_update = await user_model.update(
            {
                user_status         : 0,
                user_delete_status  : 1,
                user_delete_by      : user_id,
                user_delete_at      : new Date()
            },
            {
                where: {
                    user_id: req.params.user_id
                }
            }
        );

        return res.send({
            status  : "1",
            message : "Users Delete Successfully!",
            data    : ""
        });
    } catch (error) {
        res.send(
        {
            status  : "0",
            message : error.message,
            data    : [],
        });
    }
};

// User Group List
exports.user_group_list = async (req, res) => {
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

        const user_group = await user_group_model.findAll({
            where: {
                user_group_delete_status: 0,
                ...(user_user_group == 1 || user_user_group == 2 ?{}: {
                    user_group_id: {[Op.not]: [1,2]}
                }),
                ...(req.query.status == 'all' ?{}:{
                    user_group_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        user_group_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        user_group_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['user_group_id', 'ASC']
            ]
        });

        if(user_group.length > 0) {
            const user_group_data = await Promise.all(user_group.map(async (row) => ({
                user_group_id          : row.user_group_id ,
                user_group_code        : row.user_group_code,
                user_group_name        : row.user_group_name,
                user_group_status      : row.user_group_status
            })));

            return res.send({
                status: "1",
                message: "User Group Find Successfully!",
                data: user_group_data
            });
        }

        return res.send({
            status: "0",
            message: "User Group Not Found !",
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

// User Group List Active
exports.user_group_list_active = async (req, res) => {
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

        const user_group = await user_group_model.findAll({
            where: {
                ...(user_user_group == 1 || user_user_group == 2 ?{}: {
                    user_group_id: {[Op.not]: [1,2]}
                }),
                user_group_status: 1,
                user_group_delete_status: 0
            },
            order: [
                ['user_group_id', 'ASC']
            ]
        });

        if(user_group.length > 0) {
            const user_group_data = await Promise.all(user_group.map(async (row) => ({
                user_group_id          : row.user_group_id ,
                user_group_code        : row.user_group_code,
                user_group_name        : row.user_group_name,
                user_group_status      : row.user_group_status
            })));

            return res.send({
                status: "1",
                message: "User Group Find Successfully!",
                data: user_group_data
            });
        }
        return res.send({
            status: "0",
            message: "User Group Not Found !",
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

// Get User Group List
exports.get_user_group = async (req, res) => {
    try {
        const data = await user_group_model.findOne({
            where: {
                user_group_id: req.params.user_group_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "User Group Not Found !",
                data: "",
            });
            
        }

        return res.send({
            status: "1",
            message: "User Group Find Successfully!",
            data: {
                user_group_id: data.user_group_id,
                user_group_code: data.user_group_code,
                user_group_name: data.user_group_name,
                user_group_status: data.user_group_status
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

// Get User Group Create
exports.user_group_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const user_group = await user_group_model.create({
            user_group_code      : req.body.user_group_code,
            user_group_name      : req.body.user_group_name,
            user_group_status    : req.body.user_group_status,
            user_group_create_by : user_id,
        });

        if(user_group) {
            const data = await user_group_model.findOne({
                where: {
                    user_group_id: user_group.user_group_id
                },
            });

            return res.send({
                status: "1",
                message: "User Group Create Successfully!",
                data: {
                    user_group_id: data.user_group_id,
                    user_group_code: data.user_group_code,
                    user_group_name: data.user_group_name,
                    user_group_status: data.user_group_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "User Group Create Error !",
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

// Get User Group Update
exports.user_group_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const user_group_data = await user_group_model.findOne({
            where:{
                user_group_id: req.params.user_group_id
            }
        });

        if(!user_group_data) {
            return res.send({
                status: "0",
                message: "User Group ID Not Found!",
                data: "",
            });
        }
        const user_group = await user_group_model.update({
            user_group_code      : req.body.user_group_code,
            user_group_name      : req.body.user_group_name,
            user_group_status    : req.body.user_group_status,
            user_group_update_by : user_id,
        },
        {
            where:{
                user_group_id: req.params.user_group_id
            }
        });
        if(user_group) {
            const data = await user_group_model.findOne({
                where: {
                    user_group_id: req.params.user_group_id
                },
            });

            return res.send({
                status: "1",
                message: "User Group Update Successfully!",
                data: {
                    user_group_id: data.user_group_id,
                    user_group_code: data.user_group_code,
                    user_group_name: data.user_group_name,
                    user_group_status: data.user_group_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "User Group Update Error!",
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

// Get User Group Delete
exports.user_group_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const user_group_data = await user_group_model.findOne({
            where:{
                user_group_id: req.params.user_group_id
            }
        });

        if(!user_group_data) {
            return res.send({
                status: "0",
                message: "User Group ID Not Found!",
                data: "",
            });
        }

        const user_group = await user_group_model.update({
            user_group_status        : 0,
            user_group_delete_status : 1,
            user_group_delete_by     : user_id,
            user_group_delete_at     : new Date(),
        },
        {
            where:{
                user_group_id: req.params.user_group_id
            }
        });

        return res.send({
            status: "1",
            message: "User Group Delete Successfully!",
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

// User Count
exports.user_count = async (req, res) => {
    try {
        const data = await user_model.count({
            where: {
                user_status: 1,
                user_delete_status: 0,
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "User Count Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "User Count Successfully!",
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

// User Count Company
exports.user_count_company = async (req, res) => {
    try {
        const data = await user_model.count({
            where: {
                user_company: req.params.company,
                user_status: 1,
                user_delete_status: 0,
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "User Count Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "User Count Successfully!",
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

// User Count Branch
exports.user_count_branch = async (req, res) => {
    try {
        const data = await user_model.count({
            where: {
                user_company        : req.query.company,
                user_branch         : req.query.branch,
                user_status         : 1,
                user_delete_status  : 0,
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "User Count Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "User Count Successfully!",
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