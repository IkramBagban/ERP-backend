const { jwt_middleware, verify_middleware} = require("../middleware");
const financial_year_controller = require("../controllers/financial_year_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/financial-year/financial-year-list",[jwt_middleware.verify_token, jwt_middleware.is_user],financial_year_controller.financial_year_list);
    app.get("/financial-year/financial-year-list-active",[jwt_middleware.verify_token, jwt_middleware.is_user],financial_year_controller.financial_year_list_active);
    app.get("/financial-year/get-financial-year/:company",[jwt_middleware.verify_token, jwt_middleware.is_manager],financial_year_controller.get_financial_year);
    app.post("/financial-year/financial-year-create",[jwt_middleware.verify_token, jwt_middleware.is_manager],financial_year_controller.financial_year_create);
};