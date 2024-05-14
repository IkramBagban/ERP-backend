module.exports = (sequelize, DataTypes) => {
    const company_model = sequelize.define("company", {
        company_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        company_name: {
            type: DataTypes.STRING
        },
        company_owner_name: {
            type: DataTypes.STRING
        },
        company_phone: {
            type: DataTypes.STRING
        },
        company_email: {
            type: DataTypes.STRING
        },
        company_website: {
            type: DataTypes.STRING
        },
        company_address: {
            type: DataTypes.STRING
        },
        company_opening_date: {
            type: DataTypes.DATEONLY
        },
        company_picture: {
            type: DataTypes.TEXT
        },
        company_company_package: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        company_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Active'
        },
        company_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        company_create_by: {
            type: DataTypes.BIGINT
        },
        company_update_by: {
            type: DataTypes.BIGINT
        },
        company_delete_by: {
            type: DataTypes.BIGINT
        },
        company_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "company_create_at",
        updatedAt: "company_update_at"
    });
    return company_model;
};