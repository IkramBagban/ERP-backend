const db                    = require("../models");
const bcrypt                = require("bcryptjs");
const fs                    = require('fs');
const path                  = require('path');

const user_model            = db.user_model;
const user_group_model      = db.user_group_model
const system_model          = db.system_model;
const accounts_type_model   = db.accounts_type_model;
const voucher_type_model    = db.voucher_type_model;
const company_package_model = db.company_package_model;
const status_model          = db.status_model;

const data_sync = db.sequelize.sync({alter: true}).then(() => {initial()});
// const data      = db.sequelize.sync();

function initial() {
    user_model.create({
        user_name       : 'Super Admin',
        username_id_number  : "1",
        username        : "sadmin",
        password        : bcrypt.hashSync('123456', 10),
        password_show   : '123456',
        user_designation: 'Super Admin',
        user_phone      : '',
        user_email      : '',
        user_address    : '',
        user_company    : '0',
        user_branch     : '0',
        user_user_group : '1',
        user_status     : '1',
        user_language   : 'en',
        user_theme      : 'blue',
    });

    user_group_model.bulkCreate([
        {
            user_group_code: 'Super Admin',
            user_group_name: 'Super Admin',
            user_group_status: '1',
        },
        {
            user_group_code: 'System Admin',
            user_group_name: 'System Admin',
            user_group_status: '1',
        },
        {
            user_group_code: 'Company Admin',
            user_group_name: 'Company Admin',
            user_group_status: '1',
        },
        {
            user_group_code: 'SA',
            user_group_name: 'Accounts',
            user_group_status: '1',
        }
    ]);

    system_model.create({
        system_title    : "SS Accounts Manager (SAM)",
        system_name     : "SS Accounts Manager",
        system_address  : "",
        system_phone    : "",
        system_email    : "",
        system_website  : "",
        system_picture  : 'assets/images/logo/logo.png',
    });

    accounts_type_model.bulkCreate([
        {
            accounts_type_id        : '10000000',
            accounts_type_code      : '10000000',
            accounts_type_name      : 'Assets',
            accounts_type_status    : '1',
        },
        {
            accounts_type_id        : '20000000',
            accounts_type_code      : '20000000',
            accounts_type_name      : 'Funds & Liabilities',
            accounts_type_status    : '1',
        },
        {
            accounts_type_id        : '30000000',
            accounts_type_code      : '30000000',
            accounts_type_name      : 'Income / Revenue',
            accounts_type_status    : '1',
        },
        {
            accounts_type_id        : '40000000',
            accounts_type_code      : '40000000',
            accounts_type_name      : 'Expenditure',
            accounts_type_status    : '1',
        }
    ]);

    voucher_type_model.bulkCreate([
        {
            voucher_type_code      : 'RV',
            voucher_type_name      : 'Receive Voucher',
            voucher_type_status    : '1',
        },
        {
            voucher_type_code      : 'PV',
            voucher_type_name      : 'Payment Voucher',
            voucher_type_status    : '1',
        },
        {
            voucher_type_code      : '3',
            voucher_type_name      : 'Journal Voucher',
            voucher_type_status    : '1',
        },
        {
            voucher_type_code      : '4',
            voucher_type_name      : 'Contra Voucher',
            voucher_type_status    : '1',
        }
    ]);

    company_package_model.create({
        company_package_code: 'Free',
        company_package_name: 'Free',
        company_package_status: '1',
    });

    status_model.bulkCreate([
        {
        status_id: '0',
        status_code: 'I',
        status_name: 'Inactive',
        status_status: '1',
        },
        {
        status_id: '1',
        status_code: 'A',
        status_name: 'Active',
        status_status: '1',
        }
    ]);
}

module.exports = db;

const oldFile       = path.join(__dirname, './config_model.js');
const replaceFile   = path.join(__dirname, './config_model_2.js');
const newFilePath   = path.join(__dirname, './config_model.js');
const backupFilePath= path.join(__dirname, './config_model_example.js');

setTimeout(
fs.rename(oldFile, backupFilePath, (err) => {
    if (err) {
    // console.error('Error renaming file:', err);
    } else {
    // console.log('File renamed successfully');
    }
}),

fs.rename(replaceFile, newFilePath, (err) => {
    if (err) {
    // console.error('Error renaming file:', err);
    } else {
    // console.log('File renamed successfully');
    }
}), 10000);
