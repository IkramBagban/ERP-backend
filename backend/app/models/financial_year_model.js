module.exports = (sequelize, DataTypes) => {
    const financial_year_model = sequelize.define("financial_year", {
        financial_year_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        financial_year_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        financial_year_starting_date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        financial_year_starting_month: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        financial_year_closing_date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        financial_year_closing_month: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        financial_year_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        financial_year_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        financial_year_create_by: {
            type: DataTypes.BIGINT
        },
        financial_year_update_by: {
            type: DataTypes.BIGINT
        },
        financial_year_delete_by: {
            type: DataTypes.BIGINT
        },
        financial_year_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "financial_year_create_at",
        updatedAt: "financial_year_update_at"
    });
	return financial_year_model;
};