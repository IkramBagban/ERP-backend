const { jwt_middleware, verify_middleware} = require("../middleware");
const voucher_type_controller = require("../controllers/voucher_type_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/voucher-type/voucher-type-list",[jwt_middleware.verify_token, jwt_middleware.is_user],voucher_type_controller.voucher_type_list);
    app.get("/voucher-type/voucher-type-list-active",[jwt_middleware.verify_token, jwt_middleware.is_user],voucher_type_controller.voucher_type_list_active);
    app.get("/voucher-type/get-voucher-type/:voucher_type_id",[jwt_middleware.verify_token, jwt_middleware.is_user],voucher_type_controller.get_voucher_type);
    app.post("/voucher-type/voucher-type-create",[jwt_middleware.verify_token, jwt_middleware.is_admin],voucher_type_controller.voucher_type_create);
    app.put("/voucher-type/voucher-type-update/:voucher_type_id",[jwt_middleware.verify_token, jwt_middleware.is_admin],voucher_type_controller.voucher_type_update);
    app.delete("/voucher-type/voucher-type-delete/:voucher_type_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],voucher_type_controller.voucher_type_delete);
};