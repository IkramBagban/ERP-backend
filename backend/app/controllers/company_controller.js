require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const company_model         = db.company_model;
const user_model            = db.user_model;
const chart_of_accounts_model   = db.chart_of_accounts_model;
const financial_year_model      = db.financial_year_model;
const accounts_link_model      = db.accounts_link_model;
const company_package_model     = db.company_package_model;

const Op                    = db.Sequelize.Op;
let user_id;

// Company List
exports.company_list = async (req, res) => {
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

        const data = await company_model.findAll({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where: {
                ...(login_user_data.user_user_group == 1 ?{}:(login_user_data.user_user_group == 2)?{}:(login_user_data.user_user_group == 3)?{
                    company_id : login_user_data.user_company
                }:{}),
                ...(req.query.status == 'all' ?{}:{
                    company_status : req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        company_name: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_owner_name:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_phone:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_email:{[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        company_website:{[Op.like]: `%${req.query.search}%`}
                    }
                ]}:{}),
                company_delete_status: 0
            },
            order   : [
                ['company_id', 'DESC']
            ]
        });

        if(data.length > 0) {
            const company_data = await Promise.all(data.map(async (row) => ({
                company_id          : row.company_id ,
                company_name        : row.company_name,
                company_owner_name  : row.company_owner_name,
                company_phone       : row.company_phone,
                company_email       : row.company_email,
                company_website     : row.company_website,
                company_address     : row.company_address,
                company_opening_date: row.company_opening_date,
                company_picture     : row.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${row.company_picture}`,
                company_package     : row.company_company_package,
                company_package_code: row.company_package === null ? '' : row.company_package.company_package_name,
                company_package_name: row.company_package === null ? '' : row.company_package.company_package_name,
                company_status      : row.company_status,
                company_create_at   : row.company_create_at,
                company_update_at   : row.company_update_at
            })));

            return res.send({
                status: "1",
                message: "Company Data Found Successfully!",
                data: company_data
            });
        }

        return res.send({
            status: "0",
            message: "Company Data Not Found!",
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

// Company List Active
exports.company_list_active = async (req, res) => {
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

        const data = await company_model.findAll({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where: {
                ...(login_user_data.user_user_group == 1 ?{}:(login_user_data.user_user_group == 2)?{}:(login_user_data.user_user_group == 3)?{
                    company_id : login_user_data.user_company
                }:{
                    company_id : login_user_data.user_company
                }),
                company_status: 1,
                company_delete_status: 0
            },
            order   : [
                ['company_name', 'ASC']
            ]
        });

        if(data.length > 0) {
            const company_data = await Promise.all(data.map(async (row) => ({
                company_id          : row.company_id ,
                company_name        : row.company_name,
                company_owner_name  : row.company_owner_name,
                company_phone       : row.company_phone,
                company_email       : row.company_email,
                company_website     : row.company_website,
                company_address     : row.company_address,
                company_opening_date: row.company_opening_date,
                company_picture     : row.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${row.company_picture}`,
                company_package     : row.company_company_package,
                company_package_code: row.company_package === null ? '' : row.company_package.company_package_name,
                company_package_name: row.company_package === null ? '' : row.company_package.company_package_name,
                company_status      : row.company_status,
                company_create_at   : row.company_create_at,
                company_update_at   : row.company_update_at
            })));

            return res.send({
                status: "1",
                message: "Company Data Found Successfully!",
                data: company_data,
            });
        }

        return res.send({
            status: "0",
            message: "Company Data Not Found!",
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

// Get Company
exports.get_company = async (req, res) => {
    try {
        const data = await company_model.findOne({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where: {
                company_id: req.params.company_id
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Company Data Not Found!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Company Data Found Successfully!",
            data: {
                company_id          : data.company_id,
                company_name        : data.company_name,
                company_owner_name  : data.company_owner_name,
                company_phone       : data.company_phone,
                company_email       : data.company_email,
                company_website     : data.company_website,
                company_address     : data.company_address,
                company_opening_date: data.company_opening_date,
                company_picture     : data.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${data.company_picture}`,
                company_package     : data.company_company_package,
                company_package_code: data.company_package === null ? '' : data.company_package.company_package_name,
                company_package_name: data.company_package === null ? '' : data.company_package.company_package_name,
                company_status      : data.company_status,
                company_create_at   : data.company_create_at,
                company_update_at   : data.company_update_at
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

// Company Create
exports.company_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let company_data = await company_model.findOne({
            where: {
                company_name: req.body.company_name
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Company Name Exist!",
            data: '',
            });
        }

        // Phone Number
        company_data = await company_model.findOne({
            where: {
                company_phone: req.body.company_phone
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        company_data = await company_model.findOne({
            where: {
                company_email: req.body.company_email
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }

        // Username
        let user_data = await user_model.findOne({
            where: {
            username: req.body.username
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Username Exist!",
            data: '',
            });
        }

        // Phone Number
        user_data = await user_model.findOne({
            where: {
            user_phone: req.body.company_phone
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        user_data = await user_model.findOne({
            where: {
            user_email: req.body.company_email
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }

        const u_id_date = new Date();

        let company_picture;
        if (req.file == undefined) {
            company_picture = "assets/images/company/company-icon.png";
        } else {
            company_picture = "assets/images/company/"+req.file.filename;
        }

        const company_register = await company_model.create({
            company_name        : req.body.company_name,
            company_owner_name  : req.body.company_owner_name,
            company_phone       : req.body.company_phone,
            company_email       : req.body.company_email,
            company_website     : req.body.company_website,
            company_address     : req.body.company_address,
            company_opening_date: req.body.company_opening_date,
            company_picture     : company_picture,
            company_company_package     : req.body.company_package,
            company_status      : req.body.company_status,
            company_create_by   : user_id
        });

        if(!company_register) {
            return res.send({
                status: "0",
                message: "Company Register Failed!",
                data: "",
            });
        }

        const user_register = await user_model.create({
            user_name           : req.body.company_owner_name,
            username            : req.body.username,
            password            : bcrypt.hashSync(req.body.password, 10),
            password_show       : req.body.password,
            user_designation    : 'Company Owner',
            user_phone          : req.body.company_phone,
            user_email          : req.body.company_email,
            user_address        : req.body.company_address,
            user_company        : company_register.company_id,
            user_branch         : 0,
            user_user_group     : 3,
            user_picture        : 'assets/images/users/user-icon.png',
            user_language       : 'en',
            user_theme          : 'blue',
            user_status         : req.body.company_status,
            user_create_by      : user_id
        });

        if(!user_register) {
            return res.send({
                status: "0",
                message: "User Register Failed!",
                data: "",
            });
        }

        const user_id_number    = u_id_date.getFullYear().toString().substr(-2)+""+(u_id_date.getMonth()+1).toString().padStart(2, '0')+""+user_register.user_id.toString().padStart(6, '0');

        const user_update = await user_model.update(
            {
                user_id_number  : user_id_number
            },
            {
                where:{
                    user_id: user_register.user_id
                }
            }
        );

        const accounts_category_coa = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10100000',
                chart_of_accounts_name              : 'Fixed Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10200000',
                chart_of_accounts_name              : 'Current Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20100000',
                chart_of_accounts_name              : 'Funds',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20200000',
                chart_of_accounts_name              : 'Liabilities',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30100000',
                chart_of_accounts_name              : 'General Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30200000',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40100000',
                chart_of_accounts_name              : 'General Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40200000',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const ac_coa_create = await chart_of_accounts_model.bulkCreate(accounts_category_coa);

        const get_ac_coa_fixed_assets = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_fixed_assets = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101000',
                chart_of_accounts_name              : 'Property Plan & Equipments',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102000',
                chart_of_accounts_name              : 'Electrical & Electronics Equipments',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103000',
                chart_of_accounts_name              : 'Computers & Computer Accessories',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104000',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
        ];
        const cg_coa_fixed_assets_create = await chart_of_accounts_model.bulkCreate(control_group_coa_fixed_assets);

        const get_ac_coa_current_assets = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_current_assets = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201000',
                chart_of_accounts_name              : 'Cash in Hand & Bank',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : 'cash_in_hand_bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202000',
                chart_of_accounts_name              : 'Receivable',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203000',
                chart_of_accounts_name              : 'Advance Payments',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204000',
                chart_of_accounts_name              : 'Others Current Assets',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
        ];
        const cg_coa_current_create = await chart_of_accounts_model.bulkCreate(control_group_coa_current_assets);

        const get_ac_coa_funds = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_funds = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101000',
                chart_of_accounts_name              : 'Owner & Partner Investments',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102000',
                chart_of_accounts_name              : 'Development Funds',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20103000',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : 'income_expenditure_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104000',
                chart_of_accounts_name              : 'Other Funds',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_funds_create = await chart_of_accounts_model.bulkCreate(control_group_coa_funds);

        const get_ac_coa_liabilities = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_liabilities = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201000',
                chart_of_accounts_name              : 'Payable',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202000',
                chart_of_accounts_name              : 'Advance Receive',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203000',
                chart_of_accounts_name              : 'Financial Liabilities',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204000',
                chart_of_accounts_name              : 'Other Liabilities',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_liabilities_create = await chart_of_accounts_model.bulkCreate(control_group_coa_liabilities);

        const get_ac_coa_g_income = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_g_income = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101000',
                chart_of_accounts_name              : 'Product Sales',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102000',
                chart_of_accounts_name              : 'Service Income',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103000',
                chart_of_accounts_name              : 'Shipping Charges',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104000',
                chart_of_accounts_name              : 'Others Income',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_g_income_create = await chart_of_accounts_model.bulkCreate(control_group_coa_g_income);

        const get_ac_coa_f_income = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_f_income = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201000',
                chart_of_accounts_name              : 'Interest of Bank',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202000',
                chart_of_accounts_name              : 'Profit on FDR',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203000',
                chart_of_accounts_name              : 'Salary Deduction',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204000',
                chart_of_accounts_name              : 'Others Financial Income',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_f_income_create = await chart_of_accounts_model.bulkCreate(control_group_coa_f_income);

        const get_ac_coa_g_expense = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_g_expense = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101000',
                chart_of_accounts_name              : 'Product Purchase',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102000',
                chart_of_accounts_name              : 'Administrative Expense',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103000',
                chart_of_accounts_name              : 'Marketing Expense',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104000',
                chart_of_accounts_name              : 'Depreciation Expense',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_g_expense_create = await chart_of_accounts_model.bulkCreate(control_group_coa_g_expense);

        const get_ac_coa_f_expense = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_f_expense = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201000',
                chart_of_accounts_name              : 'Commissions & Fees Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202000',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203000',
                chart_of_accounts_name              : 'Charitable Contributions Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204000',
                chart_of_accounts_name              : 'Others Financial Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_f_expense_create = await chart_of_accounts_model.bulkCreate(control_group_coa_f_expense);

        // Start General Ledger COA

        const get_cg_coa_fixed_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101100',
                chart_of_accounts_name              : 'Property & Land Purchase',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101200',
                chart_of_accounts_name              : 'Property & Land Development',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_1);

        const get_cg_coa_fixed_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102100',
                chart_of_accounts_name              : 'Electrical Equipments',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102200',
                chart_of_accounts_name              : 'Electronics Equipments',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_2);

        const get_cg_coa_fixed_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103100',
                chart_of_accounts_name              : 'Computers & Laptop',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103200',
                chart_of_accounts_name              : 'Computer Accessories',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_3);

        const get_cg_coa_fixed_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104100',
                chart_of_accounts_name              : 'Furniture Purchase',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104200',
                chart_of_accounts_name              : 'Furniture Repair',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_4);

        const get_cg_coa_current_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201100',
                chart_of_accounts_name              : 'Cash in Hand',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : 'cash_in_hand',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201200',
                chart_of_accounts_name              : 'Cash at Bank',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : 'cash_at_bank',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_1);

        const get_cg_coa_current_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202100',
                chart_of_accounts_name              : 'Receivable from Customers',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202200',
                chart_of_accounts_name              : 'Receivable from Others',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_2);

        const get_cg_coa_current_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203100',
                chart_of_accounts_name              : 'Advance Payments to Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203200',
                chart_of_accounts_name              : 'Advance Payments to Employee',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_3);

        const get_cg_coa_current_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204100',
                chart_of_accounts_name              : 'Inventories',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204200',
                chart_of_accounts_name              : 'FDR',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_4);

        const get_cg_coa_funds_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101100',
                chart_of_accounts_name              : 'Owner Investments',
                chart_of_accounts_accounts_category : get_cg_coa_funds_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101200',
                chart_of_accounts_name              : 'Partner Investments',
                chart_of_accounts_accounts_category : get_cg_coa_funds_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_1);

        const get_cg_coa_funds_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102100',
                chart_of_accounts_name              : 'Welfare Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102200',
                chart_of_accounts_name              : 'Relief Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102300',
                chart_of_accounts_name              : 'Provident Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_2);

        const get_cg_coa_funds_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20103100',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : get_cg_coa_funds_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : 'income_expenditure_gl',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_3);

        const get_cg_coa_funds_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104100',
                chart_of_accounts_name              : 'Accumulated Depreciation Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104200',
                chart_of_accounts_name              : 'Particular Donations',
                chart_of_accounts_accounts_category : get_cg_coa_funds_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_4);

        const get_cg_coa_liabilities_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201100',
                chart_of_accounts_name              : 'Payable to Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201200',
                chart_of_accounts_name              : 'Payable to Customers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_1);

        const get_cg_coa_liabilities_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202100',
                chart_of_accounts_name              : 'Advance Receive from Customers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202200',
                chart_of_accounts_name              : 'Advance Receive from Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_2);

        const get_cg_coa_liabilities_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203100',
                chart_of_accounts_name              : 'Term Loan',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203200',
                chart_of_accounts_name              : 'Interest Payable',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_3);

        const get_cg_coa_liabilities_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204100',
                chart_of_accounts_name              : 'Short-Term Deposit',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204200',
                chart_of_accounts_name              : 'Others Liabilities',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_4);

        const get_cg_coa_g_income_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101100',
                chart_of_accounts_name              : 'Product Sales to Local Customers',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101200',
                chart_of_accounts_name              : 'Product Sales to Foreign Customers',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_1);

        const get_cg_coa_g_income_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102100',
                chart_of_accounts_name              : 'Service Income -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102200',
                chart_of_accounts_name              : 'Service Income -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_2);

        const get_cg_coa_g_income_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103100',
                chart_of_accounts_name              : 'Shipping Charges -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103200',
                chart_of_accounts_name              : 'Shipping Charges -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_3);

        const get_cg_coa_g_income_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104100',
                chart_of_accounts_name              : 'Others Income -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104200',
                chart_of_accounts_name              : 'Others Income -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_4);

        const get_cg_coa_f_income_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201100',
                chart_of_accounts_name              : 'Interest of Bank -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201200',
                chart_of_accounts_name              : 'Interest of Bank -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_1);

        const get_cg_coa_f_income_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202100',
                chart_of_accounts_name              : 'Profit on FDR -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202200',
                chart_of_accounts_name              : 'Profit on FDR -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_2);

        const get_cg_coa_f_income_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203100',
                chart_of_accounts_name              : 'Salary Deduction from Officers',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203200',
                chart_of_accounts_name              : 'Salary Deduction Staff',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_3);

        const get_cg_coa_f_income_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204100',
                chart_of_accounts_name              : 'Others Financial Income -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204200',
                chart_of_accounts_name              : 'Others Financial Income -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_4);

        const get_cg_coa_g_expense_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101100',
                chart_of_accounts_name              : 'Product Purchase from Local Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101200',
                chart_of_accounts_name              : 'Product Purchase from Foreign Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_1);

        const get_cg_coa_g_expense_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102100',
                chart_of_accounts_name              : 'Administrative Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102200',
                chart_of_accounts_name              : 'Administrative Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_2);

        const get_cg_coa_g_expense_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103100',
                chart_of_accounts_name              : 'Marketing Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103200',
                chart_of_accounts_name              : 'Marketing Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_3);

        const get_cg_coa_g_expense_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104100',
                chart_of_accounts_name              : 'Depreciation Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104200',
                chart_of_accounts_name              : 'Depreciation Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_4);

        const get_cg_coa_f_expense_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201100',
                chart_of_accounts_name              : 'Commissions & Fees Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201200',
                chart_of_accounts_name              : 'Commissions & Fees Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_1);

        const get_cg_coa_f_expense_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202100',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202200',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_2);

        const get_cg_coa_f_expense_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203100',
                chart_of_accounts_name              : 'Charitable Contributions Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203200',
                chart_of_accounts_name              : 'Charitable Contributions Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_3);

        const get_cg_coa_f_expense_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204100',
                chart_of_accounts_name              : 'Others Financial Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204200',
                chart_of_accounts_name              : 'Others Financial Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_4);

        const get_gl_coa_fixed_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101101',
                chart_of_accounts_name              : 'Property Purchase',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101102',
                chart_of_accounts_name              : 'Land Purchase',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_1);

        const get_gl_coa_fixed_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101201',
                chart_of_accounts_name              : 'Property Development',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101202',
                chart_of_accounts_name              : 'Land Development',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_2);

        const get_gl_coa_fixed_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102101',
                chart_of_accounts_name              : 'Electrical Equipments -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102102',
                chart_of_accounts_name              : 'Electrical Equipments -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_3);

        const get_gl_coa_fixed_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102201',
                chart_of_accounts_name              : 'Electronics Equipments -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102202',
                chart_of_accounts_name              : 'Electronics Equipments -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_4);

        const get_gl_coa_fixed_assets_5 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103101',
                chart_of_accounts_name              : 'Computers',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103102',
                chart_of_accounts_name              : 'Laptop',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_5);

        const get_gl_coa_fixed_assets_6 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10103200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103201',
                chart_of_accounts_name              : 'Computer Accessories -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103202',
                chart_of_accounts_name              : 'Computer Accessories -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_6);

        const get_gl_coa_fixed_assets_7 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104101',
                chart_of_accounts_name              : 'Furniture Purchase -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104102',
                chart_of_accounts_name              : 'Furniture Purchase -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_7);

        const get_gl_coa_fixed_assets_8 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104201',
                chart_of_accounts_name              : 'Furniture Repair -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104202',
                chart_of_accounts_name              : 'Furniture Repair -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_8);

        const get_gl_coa_current_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201101',
                chart_of_accounts_name              : 'Cash',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_1);

        const get_gl_coa_current_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201201',
                chart_of_accounts_name              : 'Bank-1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201202',
                chart_of_accounts_name              : 'Bank-2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_2);

        const get_gl_coa_current_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202101',
                chart_of_accounts_name              : 'Receivable from Customers -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202102',
                chart_of_accounts_name              : 'Receivable from Customers -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_3);

        const get_gl_coa_current_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202201',
                chart_of_accounts_name              : 'Receivable from Others -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202202',
                chart_of_accounts_name              : 'Receivable from Others -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_4);

        const get_gl_coa_current_assets_5 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203101',
                chart_of_accounts_name              : 'Advance Payments to Suppliers -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203102',
                chart_of_accounts_name              : 'Advance Payments to Suppliers -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_5);

        const get_gl_coa_current_assets_6 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203201',
                chart_of_accounts_name              : 'Advance Payments to Employee -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203202',
                chart_of_accounts_name              : 'Advance Payments to Employee -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_6);

        const get_gl_coa_current_assets_7 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204101',
                chart_of_accounts_name              : 'Inventories -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204102',
                chart_of_accounts_name              : 'Inventories -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_7);

        const get_gl_coa_current_assets_8 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204201',
                chart_of_accounts_name              : 'FDR -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204202',
                chart_of_accounts_name              : 'FDR -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_8);

        const get_gl_coa_funds_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101101',
                chart_of_accounts_name              : 'Company Owner',
                chart_of_accounts_accounts_category : get_gl_coa_funds_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_1);

        const get_gl_coa_funds_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101201',
                chart_of_accounts_name              : 'Partner -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_2);

        const get_gl_coa_funds_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102101',
                chart_of_accounts_name              : 'Welfare Funds -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_3);

        const get_gl_coa_funds_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102201',
                chart_of_accounts_name              : 'Relief Funds -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_4);

        const get_gl_coa_funds_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102300',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102301',
                chart_of_accounts_name              : 'Provident Funds -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_5);

        const get_gl_coa_funds_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20103101',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : get_gl_coa_funds_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : 'income_expenditure_sl',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_6);

        const get_gl_coa_funds_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104101',
                chart_of_accounts_name              : 'Accumulated Depreciation Funds',
                chart_of_accounts_accounts_category : get_gl_coa_funds_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_7);

        const get_gl_coa_funds_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104201',
                chart_of_accounts_name              : 'Particular Donations',
                chart_of_accounts_accounts_category : get_gl_coa_funds_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_8);

        const get_gl_coa_liabilities_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201101',
                chart_of_accounts_name              : 'Payable to Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_1);

        const get_gl_coa_liabilities_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201201',
                chart_of_accounts_name              : 'Payable to Customers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_2);

        const get_gl_coa_liabilities_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202101',
                chart_of_accounts_name              : 'Advance Receive from Customers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_3);

        const get_gl_coa_liabilities_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202201',
                chart_of_accounts_name              : 'Advance Receive from Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_4);

        const get_gl_coa_liabilities_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203101',
                chart_of_accounts_name              : 'Loan Bank -1',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203102',
                chart_of_accounts_name              : 'Loan Bank -2',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_5);

        const get_gl_coa_liabilities_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203201',
                chart_of_accounts_name              : 'Interest Payable',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_6);

        const get_gl_coa_liabilities_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204101',
                chart_of_accounts_name              : 'Short-Term Deposit',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_7);

        const get_gl_coa_liabilities_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204201',
                chart_of_accounts_name              : 'Others Liabilities',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_8);

        const get_gl_coa_g_income_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101101',
                chart_of_accounts_name              : 'Product Sales to Local Customers',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_1);

        const get_gl_coa_g_income_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101201',
                chart_of_accounts_name              : 'Product Sales to Foreign Customers',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_2);

        const get_gl_coa_g_income_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102101',
                chart_of_accounts_name              : 'Service Income -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_3);

        const get_gl_coa_g_income_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102201',
                chart_of_accounts_name              : 'Service Income -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_4);

        const get_gl_coa_g_income_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103101',
                chart_of_accounts_name              : 'Shipping Charges -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_5);

        const get_gl_coa_g_income_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30103200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103201',
                chart_of_accounts_name              : 'Shipping Charges -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_6);

        const get_gl_coa_g_income_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104101',
                chart_of_accounts_name              : 'Others Income -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_7);

        const get_gl_coa_g_income_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104201',
                chart_of_accounts_name              : 'Others Income -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_8);

        const get_gl_coa_f_income_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201101',
                chart_of_accounts_name              : 'Interest of Bank -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_1);

        const get_gl_coa_f_income_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201201',
                chart_of_accounts_name              : 'Interest of Bank -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_2);

        const get_gl_coa_f_income_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202101',
                chart_of_accounts_name              : 'Profit on FDR -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_3);

        const get_gl_coa_f_income_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202201',
                chart_of_accounts_name              : 'Profit on FDR -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_4);

        const get_gl_coa_f_income_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203101',
                chart_of_accounts_name              : 'Salary Deduction from Officers',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_5);

        const get_gl_coa_f_income_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203201',
                chart_of_accounts_name              : 'Salary Deduction Staff',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_6);

        const get_gl_coa_f_income_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204101',
                chart_of_accounts_name              : 'Others Financial Income -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_7);

        const get_gl_coa_f_income_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204201',
                chart_of_accounts_name              : 'Others Financial Income -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_8);

        const get_gl_coa_g_expense_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101101',
                chart_of_accounts_name              : 'Product Purchase from Local Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_1);

        const get_gl_coa_g_expense_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101201',
                chart_of_accounts_name              : 'Product Purchase from Foreign Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_2);

        const get_gl_coa_g_expense_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102101',
                chart_of_accounts_name              : 'Administrative Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_3);

        const get_gl_coa_g_expense_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102201',
                chart_of_accounts_name              : 'Administrative Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_4);

        const get_gl_coa_g_expense_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103101',
                chart_of_accounts_name              : 'Marketing Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_5);

        const get_gl_coa_g_expense_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40103200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103201',
                chart_of_accounts_name              : 'Marketing Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_6);

        const get_gl_coa_g_expense_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104101',
                chart_of_accounts_name              : 'Depreciation Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_7);

        const get_gl_coa_g_expense_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104201',
                chart_of_accounts_name              : 'Depreciation Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_8);

        const get_gl_coa_f_expense_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201101',
                chart_of_accounts_name              : 'Commissions & Fees Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_1);

        const get_gl_coa_f_expense_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201201',
                chart_of_accounts_name              : 'Commissions & Fees Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_2);

        const get_gl_coa_f_expense_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202101',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_3);

        const get_gl_coa_f_expense_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202201',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_4);

        const get_gl_coa_f_expense_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203101',
                chart_of_accounts_name              : 'Charitable Contributions Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_5);

        const get_gl_coa_f_expense_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203201',
                chart_of_accounts_name              : 'Charitable Contributions Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_6);

        const get_gl_coa_f_expense_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204101',
                chart_of_accounts_name              : 'Others Financial Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_7);

        const get_gl_coa_f_expense_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204201',
                chart_of_accounts_name              : 'Others Financial Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_8);

        const financial_year_create = await financial_year_model.create({
                financial_year_company          : company_register.company_id,
                financial_year_starting_date    : '01',
                financial_year_starting_month   : '07',
                financial_year_closing_date     : '30',
                financial_year_closing_month    : '06',
                financial_year_status           : 1
            }
        );
        const getAccountsData = async(data) => {
            const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_company: company_register.company_id, chart_of_accounts_link : data, chart_of_accounts_status:1, chart_of_accounts_delete_status:0} });
            return get_data.chart_of_accounts_id;
        };
        const accounts_link_list = [
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "cash_in_hand_bank",
                accounts_link_name      : "Cash in Hand & Bank",
                accounts_link_accounts  : await getAccountsData('cash_in_hand_bank'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "cash_in_hand",
                accounts_link_name      : "Cash in Hand",
                accounts_link_accounts  : await getAccountsData('cash_in_hand'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "cash_at_bank",
                accounts_link_name      : "Cash at Bank",
                accounts_link_accounts  : await getAccountsData('cash_at_bank'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "income_expenditure_cg",
                accounts_link_name      : "Income & Expenditure Control Group",
                accounts_link_accounts  : await getAccountsData('income_expenditure_cg'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "income_expenditure_gl",
                accounts_link_name      : "Income & Expenditure General Ledger",
                accounts_link_accounts  : await getAccountsData('income_expenditure_gl'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "income_expenditure_sl",
                accounts_link_name      : "Income & Expenditure Subsidiary Ledger",
                accounts_link_accounts  : await getAccountsData('income_expenditure_sl'),
                accounts_link_status    : 1
            }
        ];
        const accounts_link_create = await accounts_link_model.bulkCreate(accounts_link_list);

        const company = await company_model.findOne({
            include: [
                {
                    model: company_package_model,
                    association: company_model.hasOne(company_package_model, {
                        foreignKey : 'company_package_id',
                        sourceKey : "company_company_package",
                        required:false
                    })
                }
            ],
            where:{
                company_id: company_register.company_id
            }
        });

        return res.send({
            status: "1",
            message: "Company Successfully Registered!",
            data: {
                company_id          : company.company_id,
                company_name        : company.company_name,
                company_owner_name  : company.company_owner_name,
                company_phone       : company.company_phone,
                company_email       : company.company_email,
                company_website     : company.company_website,
                company_address     : company.company_address,
                company_opening_date: company.company_opening_date,
                company_picture     : company.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company.company_picture}`,
                company_package     : company.company_company_package,
                company_package_code: company.company_package === null ? '' : company.company_package.company_package_name,
                company_package_name: company.company_package === null ? '' : company.company_package.company_package_name,
                company_status      : company.company_status,
                company_create_at   : company.company_create_at,
                company_update_at   : company.company_update_at
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

// Company Register
exports.company_register = async (req, res) => {
    try {
        let company_data = await company_model.findOne({
            where: {
                company_name: req.body.company_name
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Company Name Exist!",
            data: '',
            });
        }

        // Phone Number
        company_data = await company_model.findOne({
            where: {
                company_phone: req.body.company_phone
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        company_data = await company_model.findOne({
            where: {
                company_email: req.body.company_email
            }
        });

        if(company_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }

        // Username
        let user_data = await user_model.findOne({
            where: {
            username: req.body.username
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Username Exist!",
            data: '',
            });
        }

        // Phone Number
        user_data = await user_model.findOne({
            where: {
            user_phone: req.body.company_phone
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        user_data = await user_model.findOne({
            where: {
            user_email: req.body.company_email
            }
        });

        if(user_data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }
        const u_id_date = new Date();

        let company_picture;
        if (req.file == undefined) {
            company_picture = "assets/images/company/company-icon.png";
        } else {
            company_picture = "assets/images/company/"+req.file.filename;
        }

        const company_register = await company_model.create({
            company_name        : req.body.company_name,
            company_owner_name  : req.body.company_owner_name,
            company_phone       : req.body.company_phone,
            company_email       : req.body.company_email,
            company_website     : req.body.company_website,
            company_address     : req.body.company_address,
            company_opening_date: req.body.company_opening_date,
            company_company_package : req.body.company_package,
            company_picture     : company_picture,
            company_status      : 0,
        });

        if(!company_register) {
            return res.send({
                status: "0",
                message: "Company Register Failed!",
                data: "",
            });
        }

        const user_register = await user_model.create({
            user_name           : req.body.company_owner_name,
            username            : req.body.username,
            password            : bcrypt.hashSync(req.body.password, 10),
            password_show       : req.body.password,
            user_designation    : 'Company Owner',
            user_phone          : req.body.company_phone,
            user_email          : req.body.company_email,
            user_address        : req.body.company_address,
            user_company        : company_register.company_id,
            user_branch         : 0,
            user_user_group     : 3,
            user_picture        : 'assets/images/users/user-icon.png',
            user_language       : 'en',
            user_theme          : 'blue',
            user_status         : 0
        });

        if(!user_register) {
            return res.send({
                status: "0",
                message: "User Register Failed!",
                data: "",
            });
        }

        const user_id_number    = u_id_date.getFullYear().toString().substr(-2)+""+(u_id_date.getMonth()+1).toString().padStart(2, '0')+""+user_register.user_id.toString().padStart(6, '0');

        const user_update = await user_model.update(
            {
                user_id_number  : user_id_number
            },
            {
                where:{
                    user_id: user_register.user_id
                }
            }
        );

        const accounts_category_coa = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10100000',
                chart_of_accounts_name              : 'Fixed Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10200000',
                chart_of_accounts_name              : 'Current Assets',
                chart_of_accounts_accounts_category : '10000000',
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20100000',
                chart_of_accounts_name              : 'Funds',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20200000',
                chart_of_accounts_name              : 'Liabilities',
                chart_of_accounts_accounts_category : '20000000',
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30100000',
                chart_of_accounts_name              : 'General Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30200000',
                chart_of_accounts_name              : 'Financial Income',
                chart_of_accounts_accounts_category : '30000000',
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40100000',
                chart_of_accounts_name              : 'General Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40200000',
                chart_of_accounts_name              : 'Financial Expense',
                chart_of_accounts_accounts_category : '40000000',
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'accounts_category',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const ac_coa_create = await chart_of_accounts_model.bulkCreate(accounts_category_coa);

        const get_ac_coa_fixed_assets = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_fixed_assets = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101000',
                chart_of_accounts_name              : 'Property Plan & Equipments',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102000',
                chart_of_accounts_name              : 'Electrical & Electronics Equipments',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103000',
                chart_of_accounts_name              : 'Computers & Computer Accessories',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104000',
                chart_of_accounts_name              : 'Furniture & Fixtures',
                chart_of_accounts_accounts_category : get_ac_coa_fixed_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
        ];
        const cg_coa_fixed_assets_create = await chart_of_accounts_model.bulkCreate(control_group_coa_fixed_assets);

        const get_ac_coa_current_assets = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_current_assets = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201000',
                chart_of_accounts_name              : 'Cash in Hand & Bank',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : 'cash_in_hand_bank',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202000',
                chart_of_accounts_name              : 'Receivable',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203000',
                chart_of_accounts_name              : 'Advance Payments',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204000',
                chart_of_accounts_name              : 'Others Current Assets',
                chart_of_accounts_accounts_category : get_ac_coa_current_assets.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
        ];
        const cg_coa_current_create = await chart_of_accounts_model.bulkCreate(control_group_coa_current_assets);

        const get_ac_coa_funds = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_funds = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101000',
                chart_of_accounts_name              : 'Owner & Partner Investments',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102000',
                chart_of_accounts_name              : 'Development Funds',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20103000',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : 'income_expenditure_cg',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104000',
                chart_of_accounts_name              : 'Other Funds',
                chart_of_accounts_accounts_category : get_ac_coa_funds.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_funds_create = await chart_of_accounts_model.bulkCreate(control_group_coa_funds);

        const get_ac_coa_liabilities = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_liabilities = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201000',
                chart_of_accounts_name              : 'Payable',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202000',
                chart_of_accounts_name              : 'Advance Receive',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203000',
                chart_of_accounts_name              : 'Financial Liabilities',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204000',
                chart_of_accounts_name              : 'Other Liabilities',
                chart_of_accounts_accounts_category : get_ac_coa_liabilities.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_liabilities_create = await chart_of_accounts_model.bulkCreate(control_group_coa_liabilities);

        const get_ac_coa_g_income = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_g_income = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101000',
                chart_of_accounts_name              : 'Product Sales',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102000',
                chart_of_accounts_name              : 'Service Income',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103000',
                chart_of_accounts_name              : 'Shipping Charges',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104000',
                chart_of_accounts_name              : 'Others Income',
                chart_of_accounts_accounts_category : get_ac_coa_g_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_g_income_create = await chart_of_accounts_model.bulkCreate(control_group_coa_g_income);

        const get_ac_coa_f_income = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_f_income = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201000',
                chart_of_accounts_name              : 'Interest of Bank',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202000',
                chart_of_accounts_name              : 'Profit on FDR',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203000',
                chart_of_accounts_name              : 'Salary Deduction',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204000',
                chart_of_accounts_name              : 'Others Financial Income',
                chart_of_accounts_accounts_category : get_ac_coa_f_income.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_f_income_create = await chart_of_accounts_model.bulkCreate(control_group_coa_f_income);

        const get_ac_coa_g_expense = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40100000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_g_expense = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101000',
                chart_of_accounts_name              : 'Product Purchase',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102000',
                chart_of_accounts_name              : 'Administrative Expense',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103000',
                chart_of_accounts_name              : 'Marketing Expense',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104000',
                chart_of_accounts_name              : 'Depreciation Expense',
                chart_of_accounts_accounts_category : get_ac_coa_g_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_g_expense_create = await chart_of_accounts_model.bulkCreate(control_group_coa_g_expense);

        const get_ac_coa_f_expense = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40200000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'accounts_category'
            }
        });
        const control_group_coa_f_expense = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201000',
                chart_of_accounts_name              : 'Commissions & Fees Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202000',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203000',
                chart_of_accounts_name              : 'Charitable Contributions Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204000',
                chart_of_accounts_name              : 'Others Financial Expense',
                chart_of_accounts_accounts_category : get_ac_coa_f_expense.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'control_group',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const cg_coa_f_expense_create = await chart_of_accounts_model.bulkCreate(control_group_coa_f_expense);

        // Start General Ledger COA

        const get_cg_coa_fixed_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101100',
                chart_of_accounts_name              : 'Property & Land Purchase',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101200',
                chart_of_accounts_name              : 'Property & Land Development',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_1);

        const get_cg_coa_fixed_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102100',
                chart_of_accounts_name              : 'Electrical Equipments',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102200',
                chart_of_accounts_name              : 'Electronics Equipments',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_2);

        const get_cg_coa_fixed_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103100',
                chart_of_accounts_name              : 'Computers & Laptop',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103200',
                chart_of_accounts_name              : 'Computer Accessories',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_3);

        const get_cg_coa_fixed_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_fixed_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104100',
                chart_of_accounts_name              : 'Furniture Purchase',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104200',
                chart_of_accounts_name              : 'Furniture Repair',
                chart_of_accounts_accounts_category : get_cg_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_fixed_assets_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_fixed_assets_4);

        const get_cg_coa_current_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201100',
                chart_of_accounts_name              : 'Cash in Hand',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : 'cash_in_hand',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201200',
                chart_of_accounts_name              : 'Cash at Bank',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : 'cash_at_bank',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_1);

        const get_cg_coa_current_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202100',
                chart_of_accounts_name              : 'Receivable from Customers',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202200',
                chart_of_accounts_name              : 'Receivable from Others',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_2);

        const get_cg_coa_current_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203100',
                chart_of_accounts_name              : 'Advance Payments to Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203200',
                chart_of_accounts_name              : 'Advance Payments to Employee',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_3);

        const get_cg_coa_current_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_current_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204100',
                chart_of_accounts_name              : 'Inventories',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204200',
                chart_of_accounts_name              : 'FDR',
                chart_of_accounts_accounts_category : get_cg_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_current_assets_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_current_assets_4);

        const get_cg_coa_funds_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101100',
                chart_of_accounts_name              : 'Owner Investments',
                chart_of_accounts_accounts_category : get_cg_coa_funds_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101200',
                chart_of_accounts_name              : 'Partner Investments',
                chart_of_accounts_accounts_category : get_cg_coa_funds_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_1);

        const get_cg_coa_funds_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102100',
                chart_of_accounts_name              : 'Welfare Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102200',
                chart_of_accounts_name              : 'Relief Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102300',
                chart_of_accounts_name              : 'Provident Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_2);

        const get_cg_coa_funds_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20103100',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : get_cg_coa_funds_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : 'income_expenditure_gl',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_3);

        const get_cg_coa_funds_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_funds_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104100',
                chart_of_accounts_name              : 'Accumulated Depreciation Funds',
                chart_of_accounts_accounts_category : get_cg_coa_funds_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104200',
                chart_of_accounts_name              : 'Particular Donations',
                chart_of_accounts_accounts_category : get_cg_coa_funds_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_funds_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_funds_4);

        const get_cg_coa_liabilities_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201100',
                chart_of_accounts_name              : 'Payable to Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201200',
                chart_of_accounts_name              : 'Payable to Customers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_1);

        const get_cg_coa_liabilities_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202100',
                chart_of_accounts_name              : 'Advance Receive from Customers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202200',
                chart_of_accounts_name              : 'Advance Receive from Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_2);

        const get_cg_coa_liabilities_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203100',
                chart_of_accounts_name              : 'Term Loan',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203200',
                chart_of_accounts_name              : 'Interest Payable',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_3);

        const get_cg_coa_liabilities_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_liabilities_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204100',
                chart_of_accounts_name              : 'Short-Term Deposit',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204200',
                chart_of_accounts_name              : 'Others Liabilities',
                chart_of_accounts_accounts_category : get_cg_coa_liabilities_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_liabilities_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_liabilities_4);

        const get_cg_coa_g_income_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101100',
                chart_of_accounts_name              : 'Product Sales to Local Customers',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101200',
                chart_of_accounts_name              : 'Product Sales to Foreign Customers',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_1);

        const get_cg_coa_g_income_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102100',
                chart_of_accounts_name              : 'Service Income -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102200',
                chart_of_accounts_name              : 'Service Income -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_2);

        const get_cg_coa_g_income_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103100',
                chart_of_accounts_name              : 'Shipping Charges -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103200',
                chart_of_accounts_name              : 'Shipping Charges -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_3);

        const get_cg_coa_g_income_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104100',
                chart_of_accounts_name              : 'Others Income -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104200',
                chart_of_accounts_name              : 'Others Income -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_income_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_g_income_4);

        const get_cg_coa_f_income_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201100',
                chart_of_accounts_name              : 'Interest of Bank -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201200',
                chart_of_accounts_name              : 'Interest of Bank -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_1);

        const get_cg_coa_f_income_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202100',
                chart_of_accounts_name              : 'Profit on FDR -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202200',
                chart_of_accounts_name              : 'Profit on FDR -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_2);

        const get_cg_coa_f_income_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203100',
                chart_of_accounts_name              : 'Salary Deduction from Officers',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203200',
                chart_of_accounts_name              : 'Salary Deduction Staff',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_3);

        const get_cg_coa_f_income_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204100',
                chart_of_accounts_name              : 'Others Financial Income -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204200',
                chart_of_accounts_name              : 'Others Financial Income -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_income_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_f_income_4);

        const get_cg_coa_g_expense_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40101000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101100',
                chart_of_accounts_name              : 'Product Purchase from Local Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101200',
                chart_of_accounts_name              : 'Product Purchase from Foreign Suppliers',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_1);

        const get_cg_coa_g_expense_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40102000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102100',
                chart_of_accounts_name              : 'Administrative Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102200',
                chart_of_accounts_name              : 'Administrative Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_2);

        const get_cg_coa_g_expense_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40103000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103100',
                chart_of_accounts_name              : 'Marketing Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103200',
                chart_of_accounts_name              : 'Marketing Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_3);

        const get_cg_coa_g_expense_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40104000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_g_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104100',
                chart_of_accounts_name              : 'Depreciation Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104200',
                chart_of_accounts_name              : 'Depreciation Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_g_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_g_expense_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_g_expense_4);

        const get_cg_coa_f_expense_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40201000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201100',
                chart_of_accounts_name              : 'Commissions & Fees Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201200',
                chart_of_accounts_name              : 'Commissions & Fees Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_1 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_1);

        const get_cg_coa_f_expense_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40202000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202100',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202200',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_2 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_2);

        const get_cg_coa_f_expense_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40203000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203100',
                chart_of_accounts_name              : 'Charitable Contributions Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203200',
                chart_of_accounts_name              : 'Charitable Contributions Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_3 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_3);

        const get_cg_coa_f_expense_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40204000',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'control_group'
            }
        });
        const gl_coa_f_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204100',
                chart_of_accounts_name              : 'Others Financial Expense -1',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204200',
                chart_of_accounts_name              : 'Others Financial Expense -2',
                chart_of_accounts_accounts_category : get_cg_coa_f_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'general_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const gl_coa_f_expense_create_4 = await chart_of_accounts_model.bulkCreate(gl_coa_f_expense_4);

        const get_gl_coa_fixed_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101101',
                chart_of_accounts_name              : 'Property Purchase',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101102',
                chart_of_accounts_name              : 'Land Purchase',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_1);

        const get_gl_coa_fixed_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101201',
                chart_of_accounts_name              : 'Property Development',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10101202',
                chart_of_accounts_name              : 'Land Development',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_2);

        const get_gl_coa_fixed_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102101',
                chart_of_accounts_name              : 'Electrical Equipments -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102102',
                chart_of_accounts_name              : 'Electrical Equipments -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_3);

        const get_gl_coa_fixed_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102201',
                chart_of_accounts_name              : 'Electronics Equipments -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10102202',
                chart_of_accounts_name              : 'Electronics Equipments -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_4);

        const get_gl_coa_fixed_assets_5 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103101',
                chart_of_accounts_name              : 'Computers',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103102',
                chart_of_accounts_name              : 'Laptop',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_5);

        const get_gl_coa_fixed_assets_6 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10103200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103201',
                chart_of_accounts_name              : 'Computer Accessories -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10103202',
                chart_of_accounts_name              : 'Computer Accessories -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_6);

        const get_gl_coa_fixed_assets_7 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104101',
                chart_of_accounts_name              : 'Furniture Purchase -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104102',
                chart_of_accounts_name              : 'Furniture Purchase -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_7);

        const get_gl_coa_fixed_assets_8 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_fixed_assets_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104201',
                chart_of_accounts_name              : 'Furniture Repair -1',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10104202',
                chart_of_accounts_name              : 'Furniture Repair -2',
                chart_of_accounts_accounts_category : get_gl_coa_fixed_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_fixed_assets_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_fixed_assets_8);

        const get_gl_coa_current_assets_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201101',
                chart_of_accounts_name              : 'Cash',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_1);

        const get_gl_coa_current_assets_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201201',
                chart_of_accounts_name              : 'Bank-1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10201202',
                chart_of_accounts_name              : 'Bank-2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_2);

        const get_gl_coa_current_assets_3 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202101',
                chart_of_accounts_name              : 'Receivable from Customers -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202102',
                chart_of_accounts_name              : 'Receivable from Customers -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_3);

        const get_gl_coa_current_assets_4 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202201',
                chart_of_accounts_name              : 'Receivable from Others -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10202202',
                chart_of_accounts_name              : 'Receivable from Others -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_4);

        const get_gl_coa_current_assets_5 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203101',
                chart_of_accounts_name              : 'Advance Payments to Suppliers -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203102',
                chart_of_accounts_name              : 'Advance Payments to Suppliers -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_5);

        const get_gl_coa_current_assets_6 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203201',
                chart_of_accounts_name              : 'Advance Payments to Employee -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10203202',
                chart_of_accounts_name              : 'Advance Payments to Employee -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_6);

        const get_gl_coa_current_assets_7 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204101',
                chart_of_accounts_name              : 'Inventories -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204102',
                chart_of_accounts_name              : 'Inventories -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_7);

        const get_gl_coa_current_assets_8 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '10204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_current_assets_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204201',
                chart_of_accounts_name              : 'FDR -1',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '10204202',
                chart_of_accounts_name              : 'FDR -2',
                chart_of_accounts_accounts_category : get_gl_coa_current_assets_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '10000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_current_assets_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_current_assets_8);

        const get_gl_coa_funds_1 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101101',
                chart_of_accounts_name              : 'Company Owner',
                chart_of_accounts_accounts_category : get_gl_coa_funds_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_1);

        const get_gl_coa_funds_2 = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20101201',
                chart_of_accounts_name              : 'Partner -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_2);

        const get_gl_coa_funds_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102101',
                chart_of_accounts_name              : 'Welfare Funds -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_3);

        const get_gl_coa_funds_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102201',
                chart_of_accounts_name              : 'Relief Funds -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_4);

        const get_gl_coa_funds_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20102300',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20102301',
                chart_of_accounts_name              : 'Provident Funds -1',
                chart_of_accounts_accounts_category : get_gl_coa_funds_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_5);

        const get_gl_coa_funds_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20103101',
                chart_of_accounts_name              : 'Excess of Income Over Expenditure',
                chart_of_accounts_accounts_category : get_gl_coa_funds_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : 'income_expenditure_sl',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_6);

        const get_gl_coa_funds_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104101',
                chart_of_accounts_name              : 'Accumulated Depreciation Funds',
                chart_of_accounts_accounts_category : get_gl_coa_funds_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_7);

        const get_gl_coa_funds_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_funds_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20104201',
                chart_of_accounts_name              : 'Particular Donations',
                chart_of_accounts_accounts_category : get_gl_coa_funds_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_funds_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_funds_8);

        const get_gl_coa_liabilities_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201101',
                chart_of_accounts_name              : 'Payable to Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_1);

        const get_gl_coa_liabilities_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20201201',
                chart_of_accounts_name              : 'Payable to Customers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_2);

        const get_gl_coa_liabilities_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202101',
                chart_of_accounts_name              : 'Advance Receive from Customers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_3);

        const get_gl_coa_liabilities_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20202201',
                chart_of_accounts_name              : 'Advance Receive from Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_4);

        const get_gl_coa_liabilities_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203101',
                chart_of_accounts_name              : 'Loan Bank -1',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            },
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203102',
                chart_of_accounts_name              : 'Loan Bank -2',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_5);

        const get_gl_coa_liabilities_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20203201',
                chart_of_accounts_name              : 'Interest Payable',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_6);

        const get_gl_coa_liabilities_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204101',
                chart_of_accounts_name              : 'Short-Term Deposit',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_7);

        const get_gl_coa_liabilities_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '20204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_liabilities_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '20204201',
                chart_of_accounts_name              : 'Others Liabilities',
                chart_of_accounts_accounts_category : get_gl_coa_liabilities_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '20000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_liabilities_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_liabilities_8);

        const get_gl_coa_g_income_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101101',
                chart_of_accounts_name              : 'Product Sales to Local Customers',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_1);

        const get_gl_coa_g_income_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30101201',
                chart_of_accounts_name              : 'Product Sales to Foreign Customers',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_2);

        const get_gl_coa_g_income_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102101',
                chart_of_accounts_name              : 'Service Income -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_3);

        const get_gl_coa_g_income_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30102201',
                chart_of_accounts_name              : 'Service Income -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_4);

        const get_gl_coa_g_income_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103101',
                chart_of_accounts_name              : 'Shipping Charges -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_5);

        const get_gl_coa_g_income_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30103200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30103201',
                chart_of_accounts_name              : 'Shipping Charges -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_6);

        const get_gl_coa_g_income_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104101',
                chart_of_accounts_name              : 'Others Income -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_7);

        const get_gl_coa_g_income_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_income_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30104201',
                chart_of_accounts_name              : 'Others Income -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_income_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_income_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_g_income_8);

        const get_gl_coa_f_income_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201101',
                chart_of_accounts_name              : 'Interest of Bank -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_1);

        const get_gl_coa_f_income_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30201201',
                chart_of_accounts_name              : 'Interest of Bank -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_2);

        const get_gl_coa_f_income_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202101',
                chart_of_accounts_name              : 'Profit on FDR -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_3);

        const get_gl_coa_f_income_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30202201',
                chart_of_accounts_name              : 'Profit on FDR -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_4);

        const get_gl_coa_f_income_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203101',
                chart_of_accounts_name              : 'Salary Deduction from Officers',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_5);

        const get_gl_coa_f_income_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30203201',
                chart_of_accounts_name              : 'Salary Deduction Staff',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_6);

        const get_gl_coa_f_income_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204101',
                chart_of_accounts_name              : 'Others Financial Income -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_7);

        const get_gl_coa_f_income_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '30204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_income_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '30204201',
                chart_of_accounts_name              : 'Others Financial Income -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_income_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '30000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_income_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_f_income_8);

        const get_gl_coa_g_expense_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40101100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101101',
                chart_of_accounts_name              : 'Product Purchase from Local Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_1);

        const get_gl_coa_g_expense_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40101200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40101201',
                chart_of_accounts_name              : 'Product Purchase from Foreign Suppliers',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_2);

        const get_gl_coa_g_expense_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40102100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102101',
                chart_of_accounts_name              : 'Administrative Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_3);

        const get_gl_coa_g_expense_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40102200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40102201',
                chart_of_accounts_name              : 'Administrative Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_4);

        const get_gl_coa_g_expense_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40103100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103101',
                chart_of_accounts_name              : 'Marketing Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_5);

        const get_gl_coa_g_expense_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40103200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40103201',
                chart_of_accounts_name              : 'Marketing Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_6);

        const get_gl_coa_g_expense_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40104100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104101',
                chart_of_accounts_name              : 'Depreciation Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_7);

        const get_gl_coa_g_expense_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40104200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_g_expense_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40104201',
                chart_of_accounts_name              : 'Depreciation Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_g_expense_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_g_expense_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_g_expense_8);

        const get_gl_coa_f_expense_1   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40201100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_1 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201101',
                chart_of_accounts_name              : 'Commissions & Fees Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_1.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_1 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_1);

        const get_gl_coa_f_expense_2   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40201200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_2 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40201201',
                chart_of_accounts_name              : 'Commissions & Fees Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_2.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_2 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_2);

        const get_gl_coa_f_expense_3   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40202100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_3 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202101',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_3.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_3 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_3);

        const get_gl_coa_f_expense_4   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40202200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_4 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40202201',
                chart_of_accounts_name              : 'Dues & Subscriptions Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_4.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_4 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_4);

        const get_gl_coa_f_expense_5   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40203100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_5 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203101',
                chart_of_accounts_name              : 'Charitable Contributions Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_5.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_5 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_5);

        const get_gl_coa_f_expense_6   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40203200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_6 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40203201',
                chart_of_accounts_name              : 'Charitable Contributions Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_6.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_6 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_6);

        const get_gl_coa_f_expense_7   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40204100',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_7 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204101',
                chart_of_accounts_name              : 'Others Financial Expense -1',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_7.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_7 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_7);

        const get_gl_coa_f_expense_8   = await chart_of_accounts_model.findOne({
            where: {
                chart_of_accounts_company       : company_register.company_id,
                chart_of_accounts_code          : '40204200',
                chart_of_accounts_status        : 1,
                chart_of_accounts_delete_status : 0,
                chart_of_accounts_coa_status    : 'general_ledger'
            }
        });
        const sl_coa_f_expense_8 = [
            {
                chart_of_accounts_company           : company_register.company_id,
                chart_of_accounts_code              : '40204201',
                chart_of_accounts_name              : 'Others Financial Expense -2',
                chart_of_accounts_accounts_category : get_gl_coa_f_expense_8.chart_of_accounts_id,
                chart_of_accounts_accounts_type     : '40000000',
                chart_of_accounts_coa_status        : 'subsidiary_ledger',
                chart_of_accounts_link              : '',
                chart_of_accounts_status            : 1
            }
        ];
        const sl_coa_f_expense_create_8 = await chart_of_accounts_model.bulkCreate(sl_coa_f_expense_8);

        const financial_year_create = await financial_year_model.create({
                financial_year_company          : company_register.company_id,
                financial_year_starting_date    : '01',
                financial_year_starting_month   : '07',
                financial_year_closing_date     : '30',
                financial_year_closing_month    : '06',
                financial_year_status           : 1
            }
        );
        const getAccountsData = async(data) => {
            const get_data = await chart_of_accounts_model.findOne({ where:{ chart_of_accounts_company: company_register.company_id, chart_of_accounts_link : data, chart_of_accounts_status:1, chart_of_accounts_delete_status:0} });
            return get_data.chart_of_accounts_id;
        };
        const accounts_link_list = [
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "cash_in_hand_bank",
                accounts_link_name      : "Cash in Hand & Bank",
                accounts_link_accounts  : await getAccountsData('cash_in_hand_bank'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "cash_in_hand",
                accounts_link_name      : "Cash in Hand",
                accounts_link_accounts  : await getAccountsData('cash_in_hand'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "cash_at_bank",
                accounts_link_name      : "Cash at Bank",
                accounts_link_accounts  : await getAccountsData('cash_at_bank'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "income_expenditure_cg",
                accounts_link_name      : "Income & Expenditure Control Group",
                accounts_link_accounts  : await getAccountsData('income_expenditure_cg'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "income_expenditure_gl",
                accounts_link_name      : "Income & Expenditure General Ledger",
                accounts_link_accounts  : await getAccountsData('income_expenditure_gl'),
                accounts_link_status    : 1
            },
            {
                accounts_link_company   : company_register.company_id,
                accounts_link_code      : "income_expenditure_sl",
                accounts_link_name      : "Income & Expenditure Subsidiary Ledger",
                accounts_link_accounts  : await getAccountsData('income_expenditure_sl'),
                accounts_link_status    : 1
            }
        ];
        const accounts_link_create = await accounts_link_model.bulkCreate(accounts_link_list);

        const company = await company_model.findOne({
            where:{
                company_id: company_register.company_id
            }
        });

        return res.send({
            status: "1",
            message: "Company Successfully Registered!",
            data: {
                company_id          : company.company_id,
                company_name        : company.company_name,
                company_owner_name  : company.company_owner_name,
                company_phone       : company.company_phone,
                company_email       : company.company_email,
                company_website     : company.company_website,
                company_address     : company.company_address,
                company_opening_date: company.company_opening_date,
                company_picture     : company.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company.company_picture}`,
                company_package     : company.company_company_package,
                company_status      : company.company_status,
                company_create_at   : company.company_create_at,
                company_update_at   : company.company_update_at
            }
        });
    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Company Update
exports.company_update = async (req, res) => {
    try {

        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });
        const company = await company_model.findOne({
            where: {
                company_id: req.params.company_id
            }
        });

        if(!company) {
            return res.send({
                status: "0",
                message: "Company ID Not Found!",
                data: "",
            });
        }

        let company_picture;
        if (req.file == undefined) {
            company_picture = req.body.company_picture_old;
        } else {
            company_picture = "assets/images/company/"+req.file.filename;
        }

        const data = await company_model.update({
            company_name        : req.body.company_name,
            company_owner_name  : req.body.company_owner_name,
            company_phone       : req.body.company_phone,
            company_email       : req.body.company_email,
            company_website     : req.body.company_website,
            company_address     : req.body.company_address,
            company_opening_date: req.body.company_opening_date,
            company_picture     : company_picture,
            company_company_package: req.body.company_package,
            company_status      : req.body.company_status,
            company_update_by   : user_id
        },
        {
            where: {
                company_id : req.params.company_id
            }
        });

        if(data) {
            const company = await company_model.findOne({
                include: [
                    {
                        model: company_package_model,
                        association: company_model.hasOne(company_package_model, {
                            foreignKey : 'company_package_id',
                            sourceKey : "company_company_package",
                            required:false
                        })
                    }
                ],
                where: {
                    company_id: req.params.company_id
                }
            });

            if(req.body.company_status == 0) {
                const user_update = await user_model.update({
                    user_status: 0,
                },
                {
                    where: {
                        user_company: req.params.company_id,
                        user_status: 1,
                        user_delete_status: 0,
                    }
                });
            } else {
                const user_update = await user_model.update({
                    user_status: 1,
                },
                {
                    where: {
                        user_company: req.params.company_id,
                        user_status: 0,
                        user_delete_status: 0,
                    }
                });
            }

            return res.send({
                status: "1",
                message: "Company Update Successfully!",
                data: {
                    company_id          : company.company_id,
                    company_name        : company.company_name,
                    company_owner_name  : company.company_owner_name,
                    company_phone       : company.company_phone,
                    company_email       : company.company_email,
                    company_website     : company.company_website,
                    company_address     : company.company_address,
                    company_opening_date: company.company_opening_date,
                    company_picture     : company.company_picture === null ? '' : `${process.env.BASE_URL}:${process.env.PORT}/${company.company_picture}`,
                    company_package     : company.company_company_package,
                    company_package_code: company.company_package === null ? '' : company.company_package.company_package_name,
                    company_package_name: company.company_package === null ? '' : company.company_package.company_package_name,
                    company_package     : company.company_package,
                    company_status      : company.company_status,
                    company_create_at   : company.company_create_at,
                    company_update_at   : company.company_update_at
                },
            });
        } else {
            return res.send({
                status: "0",
                message: "Company Update Failed!",
                data: "",
            });
        }

    } catch (error) {
        res.send({
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Company Delete
exports.company_delete = async (req, res) => {
    try {
        const company = await company_model.findOne({
            where: {
                company_id: req.params.company_id
            }
        });

        if(!company) {
            return res.send({
                status: "0",
                message: "Company ID Not Found!",
                data: "",
            });
        }

        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const data = await company_model.update({
            company_status          : 0,
            company_delete_status   : 1,
            company_delete_by       : user_id,
            company_delete_at       : new Date()
        },
        {
            where: {
                company_id : req.params.company_id
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Company Delete Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Company Delete Successfully!",
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

// Company Count
exports.company_count = async (req, res) => {
    try {
        const data = await company_model.count({
            where: {
                company_status: 1,
                company_delete_status: 0,
            }
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Company Count Failed!",
                data: "",
            });
        }
        return res.send({
            status: "1",
            message: "Company Count Successfully!",
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