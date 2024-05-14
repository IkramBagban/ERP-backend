const { jwt_middleware, verify_middleware, email_middleware, upload_middleware }  = require("../middleware");
const company_controller = require("../controllers/company_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/company/company-list",[jwt_middleware.verify_token, jwt_middleware.is_manager],company_controller.company_list);
    app.get("/company/company-list-active",[jwt_middleware.verify_token, jwt_middleware.is_user],company_controller.company_list_active);
    app.get("/company/get-company/:company_id",[jwt_middleware.verify_token, jwt_middleware.is_user],company_controller.get_company);
    app.post("/company/company-create",[jwt_middleware.verify_token, jwt_middleware.is_admin, upload_middleware.company_picture.single("company_picture")],company_controller.company_create);
    app.post("/company/company-register",[upload_middleware.company_picture.single("company_picture")],company_controller.company_register);
    app.put("/company/company-update/:company_id",[jwt_middleware.verify_token, jwt_middleware.is_manager, upload_middleware.company_picture.single("company_picture")],company_controller.company_update);
    app.delete("/company/company-delete/:company_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],company_controller.company_delete);
    app.get("/company/company-count/",[jwt_middleware.verify_token, jwt_middleware.is_admin],company_controller.company_count);
};