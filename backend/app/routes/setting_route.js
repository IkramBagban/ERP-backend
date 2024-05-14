const { jwt_middleware, verify_middleware, email_middleware, upload_middleware }  = require("../middleware");
const setting_controller = require("../controllers/setting_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/settings/system-setting",setting_controller.system_setting);
    app.post("/settings/system-setting-create",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],setting_controller.system_setting_create);

    app.post("/settings/system-logo-change",[jwt_middleware.verify_token, jwt_middleware.is_super_admin, upload_middleware.common_picture.single("system_picture")],setting_controller.system_logo_change);
    app.get("/settings/get-user-language/:user_id",[jwt_middleware.verify_token, jwt_middleware.is_user],setting_controller.get_user_language);
    app.put("/settings/change-user-language/:user_id",[jwt_middleware.verify_token, jwt_middleware.is_user],setting_controller.change_user_language);
    app.get("/settings/get-user-theme/:user_id",[jwt_middleware.verify_token, jwt_middleware.is_user],setting_controller.get_user_theme);
    app.put("/settings/change-user-theme/:user_id",[jwt_middleware.verify_token, jwt_middleware.is_user],setting_controller.change_user_theme);
};
