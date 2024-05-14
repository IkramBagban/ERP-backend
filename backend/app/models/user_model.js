module.exports = (sequelize, DataTypes) => {
    const user_model = sequelize.define("user", {
        user_id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        user_id_number: {
            type: DataTypes.STRING
        },
        user_name: {
            type: DataTypes.STRING
        },
        username: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.TEXT
        },
        password_show: {
            type: DataTypes.STRING
        },
        user_designation: {
            type: DataTypes.STRING
        },
        user_phone: {
            type: DataTypes.STRING
        },
        user_email: {
            type: DataTypes.STRING
        },
        user_address: {
            type: DataTypes.STRING
        },
        user_picture: {
            type: DataTypes.TEXT
        },
        user_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        user_branch: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        user_user_group: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        user_language: {
            type: DataTypes.STRING
        },
        user_theme: {
            type: DataTypes.STRING
        },
        user_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Active'
        },
        user_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        user_create_by: {
            type: DataTypes.BIGINT
        },
        user_update_by: {
            type: DataTypes.BIGINT
        },
        user_delete_by: {
            type: DataTypes.BIGINT
        },
        user_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "user_create_at",
        updatedAt: "user_update_at"
    });
    return user_model;
};