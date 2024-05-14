module.exports = (sequelize, DataTypes) => {
    const chart_of_accounts_model = sequelize.define("chart_of_accounts", {
        chart_of_accounts_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        chart_of_accounts_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        chart_of_accounts_code: {
            type: DataTypes.STRING
        },
        chart_of_accounts_name: {
            type: DataTypes.STRING
        },
        chart_of_accounts_accounts_category: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 1,
        },
        chart_of_accounts_accounts_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        chart_of_accounts_coa_status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        chart_of_accounts_link: {
            type: DataTypes.STRING
        },
        chart_of_accounts_posting_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Auto, 0 = Manual'
        },
        chart_of_accounts_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        chart_of_accounts_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        chart_of_accounts_create_by: {
            type: DataTypes.BIGINT
        },
        chart_of_accounts_update_by: {
            type: DataTypes.BIGINT
        },
        chart_of_accounts_delete_by: {
            type: DataTypes.BIGINT
        },
        chart_of_accounts_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "chart_of_accounts_create_at",
        updatedAt: "chart_of_accounts_update_at"
    });

	return chart_of_accounts_model;
};