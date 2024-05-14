module.exports = (sequelize, DataTypes) => {
    const status_model = sequelize.define("status", {
        status_id: {
            type          : DataTypes.BIGINT,
            // autoIncrement : true,
            // primaryKey    : true
        },
        status_code: {
            type: DataTypes.STRING
        },
        status_name: {
            type: DataTypes.STRING
        },
        status_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        status_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        status_create_by: {
            type: DataTypes.BIGINT
        },
        status_update_by: {
            type: DataTypes.BIGINT
        },
        status_delete_by: {
            type: DataTypes.BIGINT
        },
        status_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        // freezeTableName: true,
        createdAt: "status_create_at",
        updatedAt: "status_update_at"
    });
	return status_model;
};