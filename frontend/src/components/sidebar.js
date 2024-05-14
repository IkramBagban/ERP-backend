import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import getTranslation from "@/languages";

const Sidebar = ({user_group_name, user_group})=> {
    const lang = getTranslation();

    return (
        <>
            {/* Page Sidebar Inner Start */}
            <div className="page-sidebar-inner">

                {/* Page Sidebar Menu Start */}
                <div className="page-sidebar-menu">
                    <ul className="accordion-menu">
                        <li className="mg-l-20-force menu-navigation"> {user_group_name} {lang.module}</li>

                        {/* Dashboard Start*/}
                        <li className="animation">
                            <Link href="/"><i className="fal fa-home mg-r-3"></i> <span>{lang.dashboard}</span></Link>
                        </li>
                        {/* Dashboard End*/}

                        { ( () => {
                            // For Super Admin
                            if(user_group == 1) {
                                return (
                                    <>
                                        {/* Company & Branch*/}
                                        <li>
                                            <Link href="#company_branch" data-bs-toggle="collapse"><i className="fal fa-sitemap mg-r-3"></i> <span>{lang.company_branch}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="company_branch">
                                                <li className="animation"><Link href="/company">{lang.company}</Link></li>
                                                <li className="animation"><Link href="/company-package">{lang.company_package}</Link></li>
                                                <li className="animation"><Link href="/branch">{lang.branch}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Chart of Accounts Start*/}
                                        <li>
                                            <Link href="#accounts" data-bs-toggle="collapse"><i className="fal fa-bars mg-r-3"></i> <span>{lang.accounts}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts">
                                                <li className="animation"><Link href="/accounts/chart-of-accounts">{lang.chart_of_accounts}</Link></li>
                                                <li className="animation"><Link href="/accounts/accounts-type">{lang.accounts_type}</Link></li>
                                                <li className="animation"><Link href="/accounts/accounts-link">{lang.accounts_link}</Link></li>
                                                <li className="animation"><Link href="/accounts/financial-year">{lang.financial_year}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Voucher Start*/}
                                        <li>
                                            <Link href="#voucher" data-bs-toggle="collapse"><i className="fal fa-file-invoice mg-r-3"></i> <span>{lang.voucher}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="voucher">
                                                <li className="animation"><Link href="/voucher/new-voucher">{lang.new} {lang.voucher}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-list">{lang.voucher_list}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-search">{lang.voucher_search}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Voucher End*/}

                                        {/* Accounts Report Start*/}
                                        <li>
                                            <Link href="#accounts_report" data-bs-toggle="collapse"><i className="fal fa-file-chart-line mg-r-3"></i> <span>{lang.accounts_report}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts_report">
                                                <li className="animation"><Link href="/accounts-report/ledger-report">{lang.ledger_report}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet">{lang.balance_sheet}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure">{lang.income_expenditure}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/trial-balance">{lang.trial_balance}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/receipts-payments">{lang.receipts_payments}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet-note">{lang.balance_sheet_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure-note">{lang.income_expenditure_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/cash-book">{lang.cash_book}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/bank-book">{lang.bank_book}</Link></li>
                                                
                                                <li className="animation"><Link href="/accounts-report/changes-in-equity">{lang.changes_in_equity}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Accounts Report End*/}

                                        {/* User Start*/}
                                        <li>
                                            <Link href="#users" data-bs-toggle="collapse"><i className="fal fa-user mg-r-3"></i> <span>{lang.users}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="users">
                                                <li className="animation"><Link href="/users/user-list">{lang.user_list}</Link></li>
                                                <li className="animation"><Link href="/users/user-group">{lang.user_group}</Link></li>
                                                <li className="animation"><Link href="/users/profile">{lang.my_profile}</Link></li>
                                                <li className="animation"><Link href="/users/profile-picture">{lang.profile_picture}</Link></li>
                                                <li className="animation"><Link href="/users/change-password">{lang.change_password}</Link></li>
                                            </ul>
                                        </li>
                                        {/* User End*/}

                                        {/* Settings Start*/}
                                        <li>
                                            <Link href="#settings" data-bs-toggle="collapse"><i className="fal fa-cog mg-r-3"></i> <span>{lang.settings}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="settings">
                                                <li className="animation"><Link href="/settings/system-setup">{lang.system_setup}</Link></li>
                                                <li className="animation"><Link href="/settings/system-logo">{lang.system_logo}</Link></li>
                                                <li className="animation"><Link href="/settings/language">{lang.language}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Settings End*/}
                                    </>
                                );
                            } else
                            // For Admin
                            if(user_group == 2) {
                                return (
                                    <>
                                        {/* Company & Branch*/}
                                        <li>
                                            <Link href="#company_branch" data-bs-toggle="collapse"><i className="fal fa-sitemap mg-r-3"></i> <span>{lang.company_branch}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="company_branch">
                                                <li className="animation"><Link href="/company">{lang.company}</Link></li>
                                                <li className="animation"><Link href="/company-package">{lang.company_package}</Link></li>
                                                <li className="animation"><Link href="/branch">{lang.branch}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Chart of Accounts Start*/}
                                        <li>
                                            <Link href="#accounts" data-bs-toggle="collapse"><i className="fal fa-bars mg-r-3"></i> <span>{lang.accounts}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts">
                                                <li className="animation"><Link href="/accounts/chart-of-accounts">{lang.chart_of_accounts}</Link></li>
                                                <li className="animation"><Link href="/accounts/accounts-type">{lang.accounts_type}</Link></li>
                                                <li className="animation"><Link href="/accounts/accounts-link">{lang.accounts_link}</Link></li>
                                                <li className="animation"><Link href="/accounts/financial-year">{lang.financial_year}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Voucher Start*/}
                                        <li>
                                            <Link href="#voucher" data-bs-toggle="collapse"><i className="fal fa-file-invoice mg-r-3"></i> <span>{lang.voucher}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="voucher">
                                                <li className="animation"><Link href="/voucher/new-voucher">{lang.new} {lang.voucher}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-list">{lang.voucher_list}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-search">{lang.voucher_search}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Voucher End*/}

                                        {/* Accounts Report Start*/}
                                        <li>
                                            <Link href="#accounts_report" data-bs-toggle="collapse"><i className="fal fa-file-chart-line mg-r-3"></i> <span>{lang.accounts_report}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts_report">
                                                <li className="animation"><Link href="/accounts-report/ledger-report">{lang.ledger_report}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet">{lang.balance_sheet}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure">{lang.income_expenditure}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/trial-balance">{lang.trial_balance}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/receipts-payments">{lang.receipts_payments}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet-note">{lang.balance_sheet_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure-note">{lang.income_expenditure_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/cash-book">{lang.cash_book}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/bank-book">{lang.bank_book}</Link></li>
                                                
                                                <li className="animation"><Link href="/accounts-report/changes-in-equity">{lang.changes_in_equity}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Accounts Report End*/}

                                        {/* User Start*/}
                                        <li>
                                            <Link href="#users" data-bs-toggle="collapse"><i className="fal fa-user mg-r-3"></i> <span>{lang.users}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="users">
                                                <li className="animation"><Link href="/users/user-list">{lang.user_list}</Link></li>
                                                <li className="animation"><Link href="/users/user-group">{lang.user_group}</Link></li>
                                                <li className="animation"><Link href="/users/profile">{lang.my_profile}</Link></li>
                                                <li className="animation"><Link href="/users/profile-picture">{lang.profile_picture}</Link></li>
                                                <li className="animation"><Link href="/users/change-password">{lang.change_password}</Link></li>
                                            </ul>
                                        </li>
                                        {/* User End*/}

                                        {/* Settings Start*/}
                                        <li>
                                            <Link href="#settings" data-bs-toggle="collapse"><i className="fal fa-cog mg-r-3"></i> <span>{lang.settings}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="settings">
                                                <li className="animation"><Link href="/settings/system-setup">{lang.system_setup}</Link></li>
                                                <li className="animation"><Link href="/settings/system-logo">{lang.system_logo}</Link></li>
                                                <li className="animation"><Link href="/settings/language">{lang.language}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Settings End*/}
                                    </>
                                );
                            } else

                            // For Company
                            if(user_group == 3) {
                                return (
                                    <>
                                        {/* Company & Branch*/}
                                        <li>
                                            <Link href="#company_branch" data-bs-toggle="collapse"><i className="fal fa-sitemap mg-r-3"></i> <span>{lang.company_branch}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="company_branch">
                                                <li className="animation"><Link href="/company">{lang.company}</Link></li>
                                                <li className="animation"><Link href="/branch">{lang.branch}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Chart of Accounts Start*/}
                                        <li>
                                            <Link href="#accounts" data-bs-toggle="collapse"><i className="fal fa-bars mg-r-3"></i> <span>{lang.accounts}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts">
                                                <li className="animation"><Link href="/accounts/chart-of-accounts">{lang.chart_of_accounts}</Link></li>
                                                <li className="animation"><Link href="/accounts/financial-year">{lang.financial_year}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Voucher Start*/}
                                        <li>
                                            <Link href="#voucher" data-bs-toggle="collapse"><i className="fal fa-file-invoice mg-r-3"></i> <span>{lang.voucher}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="voucher">
                                                <li className="animation"><Link href="/voucher/new-voucher">{lang.new} {lang.voucher}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-list">{lang.voucher_list}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-search">{lang.voucher_search}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Voucher End*/}

                                        {/* Accounts Report Start*/}
                                        <li>
                                            <Link href="#accounts_report" data-bs-toggle="collapse"><i className="fal fa-file-chart-line mg-r-3"></i> <span>{lang.accounts_report}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts_report">
                                                <li className="animation"><Link href="/accounts-report/ledger-report">{lang.ledger_report}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet">{lang.balance_sheet}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure">{lang.income_expenditure}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/trial-balance">{lang.trial_balance}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/receipts-payments">{lang.receipts_payments}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet-note">{lang.balance_sheet_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure-note">{lang.income_expenditure_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/cash-book">{lang.cash_book}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/bank-book">{lang.bank_book}</Link></li>
                                                
                                                <li className="animation"><Link href="/accounts-report/changes-in-equity">{lang.changes_in_equity}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Accounts Report End*/}

                                        {/* User Start*/}
                                        <li>
                                            <Link href="#users" data-bs-toggle="collapse"><i className="fal fa-user mg-r-3"></i> <span>{lang.users}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="users">
                                                <li className="animation"><Link href="/users/user-list">{lang.user_list}</Link></li>
                                                <li className="animation"><Link href="/users/profile">{lang.my_profile}</Link></li>
                                                <li className="animation"><Link href="/users/profile-picture">{lang.profile_picture}</Link></li>
                                                <li className="animation"><Link href="/users/change-password">{lang.change_password}</Link></li>
                                            </ul>
                                        </li>
                                        {/* User End*/}

                                        {/* Settings Start*/}
                                        <li>
                                            <Link href="#settings" data-bs-toggle="collapse"><i className="fal fa-cog mg-r-3"></i> <span>{lang.settings}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="settings">
                                                <li className="animation"><Link href="/settings/language">{lang.language}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Settings End*/}
                                    </>
                                );
                            } else

                            // For Accounts
                            {
                                return (
                                    <>
                                        {/* Company & Branch*/}
                                        <li>
                                            <Link href="#company_branch" data-bs-toggle="collapse"><i className="fal fa-sitemap mg-r-3"></i> <span>{lang.company_branch}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="company_branch">
                                                <li className="animation"><Link href="/branch">{lang.branch}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Chart of Accounts Start*/}
                                        <li>
                                            <Link href="#accounts" data-bs-toggle="collapse"><i className="fal fa-bars mg-r-3"></i> <span>{lang.accounts}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts">
                                                <li className="animation"><Link href="/accounts/chart-of-accounts">{lang.chart_of_accounts}</Link></li>
                                                <li className="animation"><Link href="/accounts/financial-year">{lang.financial_year}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Chart of Accounts End*/}

                                        {/* Voucher Start*/}
                                        <li>
                                            <Link href="#voucher" data-bs-toggle="collapse"><i className="fal fa-file-invoice mg-r-3"></i> <span>{lang.voucher}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="voucher">
                                                <li className="animation"><Link href="/voucher/new-voucher">{lang.new} {lang.voucher}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-list">{lang.voucher_list}</Link></li>
                                                <li className="animation"><Link href="/voucher/voucher-search">{lang.voucher_search}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Voucher End*/}

                                        {/* Accounts Report Start*/}
                                        <li>
                                            <Link href="#accounts_report" data-bs-toggle="collapse"><i className="fal fa-file-chart-line mg-r-3"></i> <span>{lang.accounts_report}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="accounts_report">
                                                <li className="animation"><Link href="/accounts-report/ledger-report">{lang.ledger_report}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet">{lang.balance_sheet}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure">{lang.income_expenditure}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/trial-balance">{lang.trial_balance}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/receipts-payments">{lang.receipts_payments}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/balance-sheet-note">{lang.balance_sheet_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/income-expenditure-note">{lang.income_expenditure_note}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/cash-book">{lang.cash_book}</Link></li>
                                                <li className="animation"><Link href="/accounts-report/bank-book">{lang.bank_book}</Link></li>
                                                
                                                <li className="animation"><Link href="/accounts-report/changes-in-equity">{lang.changes_in_equity}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Accounts Report End*/}

                                        {/* User Start*/}
                                        <li>
                                            <Link href="#users" data-bs-toggle="collapse"><i className="fal fa-user mg-r-3"></i> <span>{lang.users}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="users">
                                                <li className="animation"><Link href="/users/profile">{lang.my_profile}</Link></li>
                                                <li className="animation"><Link href="/users/profile-picture">{lang.profile_picture}</Link></li>
                                                <li className="animation"><Link href="/users/change-password">{lang.change_password}</Link></li>
                                            </ul>
                                        </li>
                                        {/* User End*/}

                                        {/* Settings Start*/}
                                        <li>
                                            <Link href="#settings" data-bs-toggle="collapse"><i className="fal fa-cog mg-r-3"></i> <span>{lang.settings}</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                            <ul className="collapse sub-menu" id="settings">
                                                <li className="animation"><Link href="/settings/language">{lang.language}</Link></li>
                                            </ul>
                                        </li>
                                        {/* Settings End*/}
                                    </>
                                );
                            }
                        } ) ()}

                        {/* Logout Start*/}
                        <li className="animation">
                            <Link href="/logout"><i className="fal fa-sign-out mg-r-3"></i> <span>{lang.logout}</span></Link>
                        </li>
                        {/* Logout End*/}
                    </ul>
                </div>
                {/* Page Sidebar Menu End */}

                {/* Sidebar Footer Start */}
                <div className="sidebar-footer">
                    <Link className="pull-left" href="/users/profile" title={lang.my_profile}>
                        <i className="fal fa-user wd-16"></i>
                    </Link>
                    <Link className="pull-left" href="/users/profile-picture" title={lang.profile_picture}>
                        <i className="fal fa-image"></i>
                    </Link>
                    <Link className="pull-left" href="/users/change-password" title={lang.change_password}>
                        <i className="fal fa-lock"></i>
                    </Link>
                    <Link className="pull-left" href="/logout" title={lang.logout}>
                        <i className="fal fa-sign-out wd-16"></i>
                    </Link>
                </div>
                {/* Sidebar Footer End */}
                </div>
                {/* Page Sidebar Inner End */}
        </>
    );
}

export default Sidebar;