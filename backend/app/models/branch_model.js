module.exports = (sequelize, DataTypes) => {
    const branch_model = sequelize.define("branch", {
        branch_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        branch_company: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        branch_code: {
            type: DataTypes.STRING
        },
        branch_name: {
            type: DataTypes.STRING
        },
        branch_phone: {
            type: DataTypes.STRING
        },
        branch_email: {
            type: DataTypes.STRING
        },
        branch_address: {
            type: DataTypes.TEXT
        },
        branch_opening_date: {
            type: DataTypes.DATEONLY
        },
        branch_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        branch_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        branch_create_by: {
            type: DataTypes.BIGINT
        },
        branch_update_by: {
            type: DataTypes.BIGINT
        },
        branch_delete_by: {
            type: DataTypes.BIGINT
        },
        branch_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "branch_create_at",
        updatedAt: "branch_update_at"
    });
	return branch_model;
};