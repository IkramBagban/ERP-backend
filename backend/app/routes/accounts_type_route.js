const { jwt_middleware, verify_middleware} = require("../middleware");
const accounts_type_controller = require("../controllers/accounts_type_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/accounts-type/accounts-type-list",[jwt_middleware.verify_token, jwt_middleware.is_admin],accounts_type_controller.accounts_type_list);
    app.get("/accounts-type/accounts-type-list-active",[jwt_middleware.verify_token, jwt_middleware.is_admin],accounts_type_controller.accounts_type_list_active);
    app.get("/accounts-type/get-accounts-type/:accounts_type_id",[jwt_middleware.verify_token, jwt_middleware.is_admin],accounts_type_controller.get_accounts_type);
    app.post("/accounts-type/accounts-type-create",[jwt_middleware.verify_token, jwt_middleware.is_admin],accounts_type_controller.accounts_type_create);
    app.put("/accounts-type/accounts-type-update/:accounts_type_id",[jwt_middleware.verify_token, jwt_middleware.is_admin],accounts_type_controller.accounts_type_update);
    app.delete("/accounts-type/accounts-type-delete/:accounts_type_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],accounts_type_controller.accounts_type_delete);
};