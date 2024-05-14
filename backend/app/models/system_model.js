module.exports = (sequelize, DataTypes) => {
    const system_model = sequelize.define("system", {
        system_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        system_title: {
            type: DataTypes.STRING
        },
        system_name: {
            type: DataTypes.STRING
        },
        system_address: {
            type: DataTypes.STRING
        },
        system_phone: {
            type: DataTypes.STRING
        },
        system_email: {
            type: DataTypes.STRING
        },
        system_website: {
            type: DataTypes.STRING
        },
        system_picture: {
            type: DataTypes.TEXT
        },
        system_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 = Active, 0 = Active'
        },
        system_delete_status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '1 = Delete, 0 = Active'
        },
        system_create_by: {
            type: DataTypes.BIGINT
        },
        system_update_by: {
            type: DataTypes.BIGINT
        },
        system_delete_by: {
            type: DataTypes.BIGINT
        },
        system_delete_at: {
            type: DataTypes.DATE
        }
    },
    {
        createdAt: "system_create_at",
        updatedAt: "system_update_at"
    });
    return system_model;
};