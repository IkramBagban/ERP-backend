module.exports = (sequelize, DataTypes) => {
    const accounts_model = sequelize.define("accounts", {
        accounts_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        accounts_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_branch: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_posting_date: {
            type: DataTypes.DATEONLY
        },
        accounts_posting_month: {
            type: DataTypes.STRING
        },
        accounts_posting_year: {
            type: DataTypes.STRING
        },
        accounts_voucher_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_voucher_number: {
            type: DataTypes.STRING
        },
        accounts_narration: {
            type: DataTypes.STRING
        },
        accounts_total_debit: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        accounts_total_credit: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        accounts_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        accounts_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        accounts_create_by: {
            type: DataTypes.BIGINT
        },
        accounts_update_by: {
            type: DataTypes.BIGINT
        },
        accounts_delete_by: {
            type: DataTypes.BIGINT
        },
        accounts_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "accounts_create_at",
        updatedAt: "accounts_update_at"
    });
	return accounts_model;
};