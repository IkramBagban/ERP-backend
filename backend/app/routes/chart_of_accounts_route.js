const { jwt_middleware, verify_middleware} = require("../middleware");
const chart_of_accounts_controller = require("../controllers/chart_of_accounts_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/chart-of-accounts/chart-of-accounts-list",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.chart_of_accounts_list);
    app.get("/chart-of-accounts/get-chart-of-accounts/:chart_of_accounts_id",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.get_chart_of_accounts);
    app.get("/chart-of-accounts/chart-of-accounts-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.chart_of_accounts_list_active);
    app.get("/chart-of-accounts/get-chart-of-accounts-control-group/:company",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.get_chart_of_accounts_control_group);
    app.get("/chart-of-accounts/get-chart-of-accounts-general-ledger/:company",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.get_chart_of_accounts_general_ledger);
    app.get("/chart-of-accounts/get-chart-of-accounts-category/:category",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.get_chart_of_accounts_category);
    app.get("/chart-of-accounts/chart-of-accounts-list-show/:company",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.chart_of_accounts_list_show);
    app.get("/chart-of-accounts/chart-of-accounts-search/",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.chart_of_accounts_search);
    app.get("/chart-of-accounts/get-chart-of-accounts-type/:type",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.get_chart_of_accounts_type);
    app.post("/chart-of-accounts/chart-of-accounts-create",[jwt_middleware.verify_token, jwt_middleware.is_user],chart_of_accounts_controller.chart_of_accounts_create);
    app.put("/chart-of-accounts/chart-of-accounts-update/:chart_of_accounts_id",[jwt_middleware.verify_token, jwt_middleware.is_manager],chart_of_accounts_controller.chart_of_accounts_update);
    app.delete("/chart-of-accounts/chart-of-accounts-delete/:chart_of_accounts_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],chart_of_accounts_controller.chart_of_accounts_delete);
};