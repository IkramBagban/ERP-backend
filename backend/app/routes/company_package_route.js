const { jwt_middleware, verify_middleware} = require("../middleware");
const company_package_controller = require("../controllers/company_package_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/company-package/company-package-list",[jwt_middleware.verify_token, jwt_middleware.is_admin],company_package_controller.company_package_list);
    app.get("/company-package/company-package-list-active",company_package_controller.company_package_list_active);
    app.get("/company-package/get-company-package/:company_package_id",[jwt_middleware.verify_token, jwt_middleware.is_admin],company_package_controller.get_company_package);
    app.post("/company-package/company-package-create",[jwt_middleware.verify_token, jwt_middleware.is_admin],company_package_controller.company_package_create);
    app.put("/company-package/company-package-update/:company_package_id",[jwt_middleware.verify_token, jwt_middleware.is_admin],company_package_controller.company_package_update);
    app.delete("/company-package/company-package-delete/:company_package_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],company_package_controller.company_package_delete);
};