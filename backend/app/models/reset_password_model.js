module.exports = (sequelize, DataTypes) => {
    const reset_password_model = sequelize.define("reset_password", {
        reset_password_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        reset_passwords_user: {
            type: DataTypes.BIGINT
        },
        reset_passwords_email: {
            type: DataTypes.STRING
        },
        reset_passwords_otp_code: {
            type: DataTypes.TEXT
        },
        reset_passwords_otp_time: {
            type: DataTypes.DATE
        },
        reset_passwords_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        }
    },
    {
        createdAt: "reset_passwords_create_at",
        updatedAt: "reset_passwords_update_at"
    });

    return reset_password_model;
};