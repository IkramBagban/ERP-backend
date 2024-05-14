const { jwt_middleware, verify_middleware} = require("../middleware");
const accounts_controller    = require("../controllers/accounts_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/accounts/voucher-list/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.voucher_list);
    app.get("/accounts/voucher-search/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.voucher_search);
    app.get("/accounts/voucher-list-active/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.voucher_list_active);
    app.get("/accounts/voucher-list-latest/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.voucher_list_latest);
    app.get("/accounts/get-voucher/:accounts_id",accounts_controller.get_voucher);
    app.post("/accounts/voucher-create/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.voucher_create);
    app.put("/accounts/voucher-update/:accounts_id",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.voucher_update);
    app.delete("/accounts/voucher-delete/:accounts_id",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.voucher_delete);
    app.get("/accounts/ledger-report/",[jwt_middleware.verify_token],accounts_controller.ledger_report);
    app.get("/accounts/balance-sheet/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.balance_sheet);
    app.get("/accounts/income-expenditure/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.income_expenditure);
    app.get("/accounts/balance-sheet-note/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.balance_sheet_note);
    app.get("/accounts/get-balance-sheet-note/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.get_balance_sheet_note);
    app.get("/accounts/income-expenditure-note/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.income_expenditure_note);
    app.get("/accounts/get-income-expenditure-note/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.get_income_expenditure_note);
    app.get("/accounts/trial-balance/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.trial_balance);
    app.get("/accounts/receipts-payments/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.receipts_payments);
    app.get("/accounts/cash-book/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.cash_book);
    app.get("/accounts/bank-book/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.bank_book);
    app.get("/accounts/changes-in-equity/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.changes_in_equity);
    app.get("/accounts/cash-balance-company/:company",[jwt_middleware.verify_token, jwt_middleware.is_manager],accounts_controller.cash_balance_company);
    app.get("/accounts/cash-balance-branch/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.cash_balance_branch);
    app.get("/accounts/bank-balance-company/:company",[jwt_middleware.verify_token, jwt_middleware.is_manager],accounts_controller.bank_balance_company);
    app.get("/accounts/bank-balance-branch/",[jwt_middleware.verify_token, jwt_middleware.is_user],accounts_controller.bank_balance_branch);


};