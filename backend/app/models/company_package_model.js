module.exports = (sequelize, DataTypes) => {
    const company_package_model = sequelize.define("company_package", {
        company_package_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        company_package_code: {
            type: DataTypes.STRING
        },
        company_package_name: {
            type: DataTypes.STRING
        },
        company_package_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Active'
        },
        company_package_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        company_package_create_by: {
            type: DataTypes.BIGINT
        },
        company_package_update_by: {
            type: DataTypes.BIGINT
        },
        company_package_delete_by: {
            type: DataTypes.BIGINT
        },
        company_package_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "company_package_create_at",
        updatedAt: "company_package_update_at"
    });
    return company_package_model;
};