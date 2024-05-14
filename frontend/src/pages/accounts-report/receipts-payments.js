import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import Layout from '@/components/layout';

import { useDownloadExcel } from 'react-export-table-to-excel';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';
import AccountsNumberFormat from '@/components/accounts-number-format';
import CompanyInfo from '@/components/company-info';

const ReceiptsPayments = ()=> {
    let user_id, user_group, user_company, user_branch;
    if (typeof window !== 'undefined') {
        user_id         = localStorage.getItem('user_id');
        user_group      = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');
        user_branch     = localStorage.getItem('user_branch');

        // user_group =1 Super Admin, user_group =2 Admin, user_group =3 Manager, user_group =4 User
        if(user_group == 1 || user_group == 2 || user_group == 3 || user_group == 3 || user_group == 4) { } else {
            router.replace('/logout');
            return true;
        }
    }

    const lang = getTranslation();

    const [searchButton, setSearchButton]               = useState(false);

    const excelExportRef                                = useRef(null);
    const { onDownload } = useDownloadExcel({
        currentTableRef : excelExportRef.current,
        filename        : 'receipts-payments',
        sheet           : 'Receipts Payments'
    });

    const [user_user_group, setUser_user_group]         = useState('');
    const [warningModal, setWarningModal]               = useState(false);
    const [message, setMassage]                         = useState('');

    const [company_list, setCompany_list]               = useState([]);
    const [branch_list, setBranch_list]                 = useState([]);

    const [company, setCompany]                         = useState(user_company || '');
    const [branch, setBranch]                           = useState(user_branch || '');
    const [starting_date, setStarting_date]             = useState(new Date().toISOString().split('T')[0]);
    const [closing_date, setClosing_date]               = useState(new Date().toISOString().split('T')[0]);

    const [company_info, setCompany_info]                   = useState('');
    const [branch_info, setBranch_info]                     = useState('');
    const [starting_closing_date, setStarting_closing_date] = useState('');
    const [financial_year, setFinancial_year]               = useState('');
    const [cash_bank_opening_coa_list, setCash_bank_opening_coa_list] = useState([]);
    const [receipts_coa_list, setReceipts_coa_list]                   = useState([]);
    const [payments_coa_list, setPayments_coa_list]                   = useState([]);
    const [receipts_payments_total_amount, setReceipts_payments_total_amount]    = useState('');
    const [cash_bank_closing_coa_list, setCash_bank_closing_coa_list] = useState([]);
    const receipts_sub_total = receipts_coa_list.reduce((acc, row) => acc + parseFloat(row.amount), 0);
    const payments_sub_total = payments_coa_list.reduce((acc, row) => acc + parseFloat(row.amount), 0);
    const cash_bank_opening_balance = cash_bank_opening_coa_list.reduce((acc, row) => acc + parseFloat(row.amount), 0);
    const cash_bank_closing_balance = cash_bank_closing_coa_list.reduce((acc, row) => acc + parseFloat(row.amount), 0);

    const companyData = () => {
        const axios = apiUrl.get("/company/company-list-active");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCompany_list(result_data.data);
            } else {
                setCompany_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const branchData = () => {
        const axios = apiUrl.get("/branch/get-branch-company/"+company);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setBranch_list(result_data.data);
            } else {
                setBranch_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const searchBalanceSheet = ()=> {
        setSearchButton(true);
        if(company <= 0) {
            setMassage(lang.company_select_warning);
            setWarningModal(true);
            setSearchButton(false);
        } else if(branch <= 0) {
            setMassage(lang.branch_select_warning);
            setWarningModal(true);
            setSearchButton(false);
        } else if(closing_date.length <= 0) {
            setMassage(lang.closing_date_select_warning);
            setWarningModal(true);
            setSearchButton(false);
        } else {
            const axios = apiUrl.get("/accounts/receipts-payments/?company="+company+"&branch="+branch+"&starting_date="+starting_date+"&closing_date="+closing_date);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setCompany_info(result_data.data.company)
                    setBranch_info(result_data.data.branch)
                    setStarting_closing_date(result_data.data.starting_closing_date)
                    setFinancial_year(result_data.data.financial_year);
                    setCash_bank_opening_coa_list(result_data.data.cash_bank_opening_coa);
                    setReceipts_coa_list(result_data.data.receipts_coa);
                    setPayments_coa_list(result_data.data.payments_coa);
                    setReceipts_payments_total_amount(result_data.data.receipts_payments_total_amount);
                    setCash_bank_closing_coa_list(result_data.data.cash_bank_closing_coa);
                    setSearchButton(false);
                } else {
                    setCompany_info('')
                    setBranch_info('')
                    setStarting_closing_date('')
                    setFinancial_year('');
                    setCash_bank_opening_coa_list([]);
                    setReceipts_coa_list([]);
                    setPayments_coa_list([]);
                    setReceipts_payments_total_amount('');
                    setCash_bank_closing_coa_list([]);
                    setSearchButton(false);
                }
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    useEffect(() => {
        setUser_user_group(user_group);
        companyData();
        branchData();
    }, [company]);

    return (
        <Layout>
            <HeaderTitle title={lang.receipts_payments} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5 d-print-none">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.receipts_payments}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/voucher">{lang.accounts_report}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.receipts_payments}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.print} onClick={() => window.print()}><i className="fal fa-print"></i></button>
                            {/* <button type="button" className="btn btn-info rounded-pill pd-t-6-force pd-b-5-force" title={lang.excel_export} onClick={onDownload}><i className="fal fa-file-excel"></i></button> */}
                        </div>
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <div className="col-md-12 mg-b-15">
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="company">{lang.company}</label>
                                    <select type="text" className="form-control bd-info" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {company_list.map(company_row => (
                                        <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="branch">{lang.branch}</label>
                                    <select type="text" className="form-control bd-info" id="branch" name="branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                        <option value="all">All</option>
                                        :''}
                                        {branch_list.map(branch_row => (
                                        <option key={branch_row.branch_id} value={branch_row.branch_id}>{branch_row.branch_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-2 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="starting_date">{lang.from_date}</label>
                                    <input type="date" className="form-control bd-info" id="starting_date" name="starting_date" value={starting_date} onChange={(e) => setStarting_date(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-2 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="closing_date">{lang.to_date}</label>
                                    <input type="date" className="form-control bd-info" id="closing_date" name="closing_date" value={closing_date} onChange={(e) => setClosing_date(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-2 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="search">&nbsp;</label>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${searchButton?'disabled': ''}`} onClick={() => searchBalanceSheet()}>{searchButton?lang.process: lang.search}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {company_info &&
                        <div className="row clearfix mb-3 d-none d-print-block">
                            <div className="col-md-12 tx-center">
                                <CompanyInfo company_data={company_info} branch_data={branch_info} />

                                <table className="mt-3" width="100%" align="center">
                                        <tbody>
                                            <tr className="">
                                                <th className="tx-left" width="30%" valign="top">
                                                </th>
                                                <th className="tx-center tx-uppercase" width="40%" valign="top">
                                                    <span className='tx-uppercase text-decoration-underline tx-16'>{lang.receipts_payments}</span>
                                                </th>
                                                <th className="tx-right" width="30%" valign="top">
                                                    {lang.print}: {new Date().toLocaleString("en-in", { day : '2-digit', month: '2-digit', year:'numeric', hour: "2-digit", minute: "2-digit"})}
                                                </th>
                                            </tr>
                                            <tr className="">
                                                <th className="tx-center tx-uppercase" colSpan="3" valign="top">
                                                    From the Date of {new Date(starting_closing_date.starting_date).toLocaleString("en-US", { day : '2-digit', month: 'short', year:'numeric'})} to {new Date(starting_closing_date.closing_date).toLocaleString("en-US", { day : '2-digit', month: 'short', year:'numeric'})}
                                                </th>
                                            </tr>
                                        </tbody>
                                    </table>
                            </div>

                        </div>
                        }

                        <div className="table-responsive">
                            {searchButton?
                            <table className="table table-striped table-bordered" width="100%">
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                            : <>
                            {receipts_coa_list.length || payments_coa_list.length > 0 ?
                            <>
                            <table className="table-striped table-hover table-centered align-middle table-nowrap" width="100%" ref={excelExportRef}>
                                <tbody>
                                    <tr className="text-uppercase">
                                        <th className="tx-left" colSpan={2}>{lang.receipts}</th>
                                    </tr>
                                    <tr className="text-uppercase">
                                        <th className="tx-center bd-all" width="75%">{lang.particulars} </th>
                                        <th className="tx-center bd-all" width="25%">{lang.amount} </th>
                                    </tr>

                                    <tr>
                                        <th className="tx-left bd-left" valign="top">Balance b/d (Opening Balance)</th>
                                        <td className="tx-center bd-left bd-right" valign="top"></td>
                                    </tr>
                                    {cash_bank_opening_coa_list.length !== 0 && cash_bank_opening_coa_list.map((opening_row, index) => (
                                    <tr key={index}>
                                        <td className="tx-left bd-left" valign="top">{opening_row.chart_of_accounts_code} - {opening_row.chart_of_accounts_name}</td>
                                        <td className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={opening_row.amount} /></td>
                                    </tr>
                                    ))}

                                    {receipts_coa_list.length !== 0 && receipts_coa_list.map((receipts_coa_row, index) => (
                                    <tr key={index}>
                                        <td className="tx-left bd-left" valign="top">{receipts_coa_row.chart_of_accounts_code} - {receipts_coa_row.chart_of_accounts_name}</td>
                                        <td className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={receipts_coa_row.amount} /></td>
                                    </tr>
                                    ))}
                                    <tr className="bd-left bd-right">
                                        <th className="tx-right text-uppercase bd-all">{lang.total} {lang.receipts}</th>
                                        <th className="tx-right bd-all">
                                            <AccountsNumberFormat amount={receipts_payments_total_amount.receipts_total_amount} />
                                        </th>
                                    </tr>

                                    <tr className="text-uppercase">
                                        <th className="tx-left" colSpan={2}><br/>{lang.payments}</th>
                                    </tr>
                                    <tr className="text-uppercase">
                                        <th className="tx-center bd-all" width="75%">{lang.particulars} </th>
                                        <th className="tx-center bd-all" width="25%">{lang.amount} </th>
                                    </tr>
                                    {payments_coa_list.length !== 0 && payments_coa_list.map((payments_coa_row, index) => (
                                    <tr key={index}>
                                        <td className="tx-left bd-left" valign="top">{payments_coa_row.chart_of_accounts_code} - {payments_coa_row.chart_of_accounts_name}</td>
                                        <td className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={payments_coa_row.amount} /></td>
                                    </tr>
                                    ))}
                                    <tr>
                                        <th className="tx-left bd-left" valign="top">Balance c/d (Closing Balance)</th>
                                        <td className="tx-center bd-left bd-right" valign="top"></td>
                                    </tr>

                                    {cash_bank_closing_coa_list.length !== 0 && cash_bank_closing_coa_list.map((closing_row, index) => (
                                    <tr key={index}>
                                        <td className="tx-left bd-left" valign="top">{closing_row.chart_of_accounts_code} - {closing_row.chart_of_accounts_name}</td>
                                        <td className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={closing_row.amount} /></td>
                                    </tr>
                                    ))}
                                    <tr className="bd-left bd-right">
                                        <th className="tx-right text-uppercase bd-all">{lang.total} {lang.payments}</th>
                                        <th className="tx-right bd-all">
                                            <AccountsNumberFormat amount={receipts_payments_total_amount.payments_total_amount} />
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                            <br/><br/><br/><br/>
                            <table className="" width="100%" align="center">
                                <tbody>
                                    <tr className="text-uppercase">
                                        <th width="20%" className="tx-center bd-top">{lang.prepared_by}</th>
                                        <th width="20%"></th>
                                        <th width="20%" className="tx-center bd-top">{lang.checked_by}</th>
                                        <th width="20%"></th>
                                        <th width="20%" className="tx-center bd-top">{lang.authorized}</th>
                                    </tr>
                                </tbody>
                            </table>
                            </>
                            : ''}
                            </>
                            }
                        </div>
                    </div>
                </div>
                {/* Content End */}

            </div>

            {/* Warning Modal Start*/}
            <div className={`modal fade ${warningModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-danger m-0 p-2">
                            <h6 className="modal-title text-white"> </h6>
                            <button type="button" className="btn-close" onClick={() => setWarningModal()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tx-center tx-50 tx-warning">
                                        <i className="fal fa-exclamation-circle"></i>
                                    </div>
                                    <h4 className="tx-danger tx-uppercase tx-13 tx-center">{message}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer bd-top p-2">
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => setWarningModal(false)}><i className="fal fa-times-circle"></i> {lang.close}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Warning Modal End*/}
            <ToastContainer />
        </Layout>
    )
}

export default  ReceiptsPayments;
