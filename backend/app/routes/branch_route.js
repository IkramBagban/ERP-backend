const { jwt_middleware, verify_middleware, email_middleware, upload_middleware }  = require("../middleware");
const branch_controller = require("../controllers/branch_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/branch/branch-list",[jwt_middleware.verify_token, jwt_middleware.is_user],branch_controller.branch_list);
    app.get("/branch/branch-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_user],branch_controller.branch_list_active);
    app.get("/branch/get-branch/:branch_id",[jwt_middleware.verify_token, jwt_middleware.is_user],branch_controller.get_branch);
    app.get("/branch/get-branch-company/:company_id",[jwt_middleware.verify_token, jwt_middleware.is_user],branch_controller.get_branch_company);
    app.post("/branch/branch-create",[jwt_middleware.verify_token, jwt_middleware.is_manager],branch_controller.branch_create);
    app.put("/branch/branch-update/:branch_id",[jwt_middleware.verify_token, jwt_middleware.is_manager],branch_controller.branch_update);
    app.delete("/branch/branch-delete/:branch_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],branch_controller.branch_delete);
    app.get("/branch/branch-count",[jwt_middleware.verify_token, jwt_middleware.is_admin],branch_controller.branch_count);
    app.get("/branch/branch-count-company/:company",[jwt_middleware.verify_token, jwt_middleware.is_manager],branch_controller.branch_count_company);
};