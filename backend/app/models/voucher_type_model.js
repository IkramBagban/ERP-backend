module.exports = (sequelize, DataTypes) => {
    const voucher_type_model = sequelize.define("voucher_type", {
        voucher_type_id: {
            type          : DataTypes.BIGINT,
            autoIncrement : true,
            primaryKey    : true
        },
        voucher_type_code: {
            type: DataTypes.STRING
        },
        voucher_type_name: {
            type: DataTypes.STRING
        },
        voucher_type_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Inactive'
        },
        voucher_type_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        voucher_type_create_by: {
            type: DataTypes.BIGINT
        },
        voucher_type_update_by: {
            type: DataTypes.BIGINT
        },
        voucher_type_delete_by: {
            type: DataTypes.BIGINT
        },
        voucher_type_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "voucher_type_create_at",
        updatedAt: "voucher_type_update_at"
    });
	return voucher_type_model;
};