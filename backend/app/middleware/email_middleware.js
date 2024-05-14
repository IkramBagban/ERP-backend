require("dotenv").config();
const nodemailer    = require("nodemailer");
const mailgen       = require('mailgen');

exports.send_register_email = async (user) => {
    let config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_MAIL, // generated ethereal user
            pass: process.env.SMTP_PASSWORD, // generated ethereal password
        }
    }

    let main_transporter = nodemailer.createTransport(config);

    let mail_generator = new mailgen({
        theme: "default",
        product : {
            name: "PLAY APP",
            link : `${process.env.APP_BASE_URL}`
        }
    })

    let response = {
        body: {
            name    : user.user_name,
            intro   : "Welcome to <b>PLAY APP PVT. LTD.</b> Your Login Details here",
            table   : {
                data : [
                    {
                        USERNAME  : user.username,
                        PASSWORD  : user.password
                    }
                ]
            },
            outro: `<a href="${process.env.APP_BASE_URL}/login">Click Here</a> to Login`
        }
    }

    let mail = mail_generator.generate(response)

    let message = {
        from : process.env.SMTP_FROM_MAIL,
        to : user.user_email,
        subject: "Play App Username & Password",
        html: mail
    }

    main_transporter.sendMail(message).then(() => {
        return true;
    })
};