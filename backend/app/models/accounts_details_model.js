module.exports = (sequelize, DataTypes) => {
    const accounts_details_model = sequelize.define("accounts_details", {
        accounts_details_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        accounts_details_company: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_branch: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_accounts: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_posting_date: {
            type: DataTypes.DATEONLY
        },
        accounts_details_posting_month: {
            type: DataTypes.STRING
        },
        accounts_details_posting_year: {
            type: DataTypes.STRING
        },
        accounts_details_voucher_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_voucher_number: {
            type: DataTypes.STRING
        },
        accounts_details_narration: {
            type: DataTypes.STRING
        },
        accounts_details_accounts_type: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_accounts_category: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_control_group: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_general_ledger: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_subsidiary_ledger: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_debit: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_credit: {
            type: DataTypes.DECIMAL(20,2),
            allowNull: false,
            defaultValue: 0,
        },
        accounts_details_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Active, 0 = Inactive'
        },
        accounts_details_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        accounts_details_create_by: {
            type: DataTypes.BIGINT
        },
        accounts_details_update_by: {
            type: DataTypes.BIGINT
        },
        accounts_details_delete_by: {
            type: DataTypes.BIGINT
        },
        accounts_details_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "accounts_details_create_at",
        updatedAt: "accounts_details_update_at"
    });
	return accounts_details_model;
};