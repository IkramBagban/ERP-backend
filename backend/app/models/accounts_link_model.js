module.exports = (sequelize, DataTypes) => {
    const accounts_link_model = sequelize.define("accounts_link", {
        accounts_link_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        accounts_link_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        accounts_link_code: {
            type: DataTypes.STRING
        },
        accounts_link_name: {
            type: DataTypes.STRING
        },
        accounts_link_accounts: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
        },
        accounts_link_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        accounts_link_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        accounts_link_create_by: {
            type: DataTypes.BIGINT
        },
        accounts_link_update_by: {
            type: DataTypes.BIGINT
        },
        accounts_link_delete_by: {
            type: DataTypes.BIGINT
        },
        accounts_link_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "accounts_link_create_at",
        updatedAt: "accounts_link_update_at"
    });
	return accounts_link_model;
};