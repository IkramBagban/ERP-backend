const { jwt_middleware, verify_middleware} = require("../middleware");
const accounts_link_controller = require("../controllers/accounts_link_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Link, Accept"
        );
        next();
    });

    app.get("/accounts-link/accounts-link-list",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_link_controller.accounts_link_list);
    app.get("/accounts-link/accounts-link-list-active",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_link_controller.accounts_link_list_active);
    app.get("/accounts-link/get-accounts-link/:accounts_link_id",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_link_controller.get_accounts_link);
    app.post("/accounts-link/accounts-link-create",[jwt_middleware.verify_token, jwt_middleware.is_admin],accounts_link_controller.accounts_link_create);
    app.put("/accounts-link/accounts-link-update/:accounts_link_id",[jwt_middleware.verify_token, jwt_middleware.is_manager],accounts_link_controller.accounts_link_update);
    app.delete("/accounts-link/accounts-link-delete/:accounts_link_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],accounts_link_controller.accounts_link_delete);
};