module.exports = (sequelize, DataTypes) => {
    const user_group_model = sequelize.define("user_group", {
        user_group_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_group_code: {
            type: DataTypes.STRING
        },
        user_group_name: {
            type: DataTypes.STRING
        },
        user_group_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Active'
        },
        user_group_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        user_group_create_by: {
            type: DataTypes.BIGINT
        },
        user_group_update_by: {
            type: DataTypes.BIGINT
        },
        user_group_delete_by: {
            type: DataTypes.BIGINT
        },
        user_group_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "user_group_create_at",
        updatedAt: "user_group_update_at"
    });
    return user_group_model;
};