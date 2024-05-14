const db                    = require("../models");
const ROLES                 = db.USER_GROUP;
const user_model            = db.user_model;
const company_model         = db.company_model;

check_duplicate_user_register = async (req, res, next) => {
    try {
        // Username
        let user = await user_model.findOne({
            where: {
            username: req.body.username
            }
        });

        if(user) {
            return res.send({
            status: "0",
            message: "Username Exist!",
            data: '',
            });
        }

        // Phone Number
        user = await user_model.findOne({
            where: {
            user_phone: req.body.user_phone
            }
        });

        if(user) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        user = await user_model.findOne({
            where: {
            user_email: req.body.user_email
            }
        });

        if(user) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }
        next();
    } catch (error) {
        return res.send({
            status: "0",
            message: error.message,
            data: '',
        });
    }
};

check_duplicate_company_register = async (req, res, next) => {
    try {
        // Username
        let data = await company_model.findOne({
            where: {
                company_name: req.body.company_name
            }
        });

        if(data) {
            return res.send({
            status: "0",
            message: "Company Name Exist!",
            data: '',
            });
        }

        // Phone Number
        data = await company_model.findOne({
            where: {
                company_phone: req.body.company_phone
            }
        });

        if(data) {
            return res.send({
            status: "0",
            message: "Phone Number Exist!",
            data: '',
            });
        }

        // Email
        data = await company_model.findOne({
            where: {
                company_email: req.body.company_email
            }
        });

        if(data) {
            return res.send({
            status: "0",
            message: "Email Exist!",
            data: '',
            });
        }
        next();
    } catch (error) {
        return res.send({
            status: "0",
            message: error.message,
            data: '',
        });
    }
};

// User Group for Single Roles
check_group_existed = (req, res, next) => {
    if(req.body.user_role) {
        if(!ROLES.includes(req.body.user_role)) {
            res.send({
                message: "Failed! Group Does Not Exist = " + req.body.user_role
            });
            return;
        }
    }
    next();
};

// Purchase Create
purchase_create = async (req, res, next) => {
    try {
        const purchase_data = req.body.purchase_list;

        // if(purchase_data.purchase_date.length <= 0) {
        //     return res.send({
        //     status: "0",
        //     message: "Failed! Please Select Date!",
        //     data: {},
        //     });
        // }

        if(purchase_data.purchase_supplier <= 0) {
            return res.send({
            status: "0",
            message: "Failed! Please Select Supplier!",
            data: {},
            });
        }

        if(purchase_data.purchase_branch.length <= 0) {
            return res.send({
            status: "0",
            message: "Failed! Please Select Branch!",
            data: {},
            });
        }

        if(purchase_data.purchase_warehouse.length <= 0) {
            return res.send({
            status: "0",
            message: "Failed! Please Select Warehouse!",
            data: {},
            });
        }

        if(purchase_data.paid_amount <= 0) {
            return res.send({
            status: "0",
            message: "Failed! Minimum Paid Amount Zero!",
            data: {},
            });
        }
        next();
    } catch (error) {
        return res.send({
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

const verify_middleware = {
    check_duplicate_user_register,
    check_duplicate_company_register,
    check_group_existed,
    purchase_create,
};

module.exports = verify_middleware;