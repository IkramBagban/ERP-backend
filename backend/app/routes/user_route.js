const { jwt_middleware, verify_middleware, email_middleware, upload_middleware }  = require("../middleware");
const user_controller    = require("../controllers/user_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/users/user-create",[jwt_middleware.verify_token, jwt_middleware.is_manager, verify_middleware.check_duplicate_user_register],user_controller.user_register);
    app.post("/users/login", user_controller.user_login);
    app.get("/users/logout/:user_id", user_controller.user_logout);
    app.get("/users/user-list", [jwt_middleware.verify_token, jwt_middleware.is_manager],user_controller.user_list);
    app.get("/users/user-list-active", [jwt_middleware.verify_token, jwt_middleware.is_manager],user_controller.user_list_active);
    app.get("/users/get-user/:user_id", [jwt_middleware.verify_token, jwt_middleware.is_user],user_controller.get_user);
    app.put("/users/user-update/:user_id", [jwt_middleware.verify_token, jwt_middleware.is_manager],user_controller.user_update);
    app.put("/users/profile-update/:user_id", [jwt_middleware.verify_token],user_controller.profile_update);
    app.put("/users/change-profile-picture/:user_id", [jwt_middleware.verify_token, upload_middleware.profile_picture.single("user_picture")],user_controller.change_profile_picture);

    app.post("/users/reset-password-verify",user_controller.reset_password_verify);
    app.put("/users/reset-password/:user_id",user_controller.reset_password);
    app.put("/users/change-password/:user_id", [jwt_middleware.verify_token],user_controller.change_password);
    app.delete("/users/user-delete/:user_id", [jwt_middleware.verify_token, jwt_middleware.is_admin],user_controller.user_delete);

    app.get("/users/user-group-list",[jwt_middleware.verify_token, jwt_middleware.is_admin],user_controller.user_group_list);
    app.get("/users/user-group-list-active",[jwt_middleware.verify_token, jwt_middleware.is_manager],user_controller.user_group_list_active);
    app.get("/users/get-user-group/:user_group_id",[jwt_middleware.verify_token, jwt_middleware.is_manager],user_controller.get_user_group);
    app.post("/users/user-group-create",[jwt_middleware.verify_token, jwt_middleware.is_admin],user_controller.user_group_create);
    app.put("/users/user-group-update/:user_group_id",[jwt_middleware.verify_token, jwt_middleware.is_admin],user_controller.user_group_update);
    app.delete("/users/user-group-delete/:user_group_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],user_controller.user_group_delete);
    app.get("/users/user-count",[jwt_middleware.verify_token, jwt_middleware.is_admin],user_controller.user_count);
    app.get("/users/user-count-company/:company",[jwt_middleware.verify_token, jwt_middleware.is_manager],user_controller.user_count_company);
    app.get("/users/user-count-branch/",[jwt_middleware.verify_token, jwt_middleware.is_user],user_controller.user_count_branch);


};
