module.exports = (sequelize, DataTypes) => {
    const accounts_type_model = sequelize.define("accounts_type", {
        accounts_type_id: {
            type          : DataTypes.BIGINT,
            // autoIncrement : true,
            // primaryKey    : true
        },
        accounts_type_code: {
            type: DataTypes.STRING
        },
        accounts_type_name: {
            type: DataTypes.STRING
        },
        accounts_type_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        accounts_type_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        accounts_type_create_by: {
            type: DataTypes.BIGINT
        },
        accounts_type_update_by: {
            type: DataTypes.BIGINT
        },
        accounts_type_delete_by: {
            type: DataTypes.BIGINT
        },
        accounts_type_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "accounts_type_create_at",
        updatedAt: "accounts_type_update_at"
    });
	return accounts_type_model;
};