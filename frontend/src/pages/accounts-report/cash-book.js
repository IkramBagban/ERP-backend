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
import numberToWords from 'number-to-words';

const CashBook = ()=> {
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
        filename        : 'cash-book',
        sheet           : 'Cash Book'
    });

    const [user_user_group, setUser_user_group]         = useState('');
    const [warningModal, setWarningModal]               = useState(false);
    const [voucherModal, setVoucherModal]               = useState(false);
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

    const [opening_balance, setOpening_balance]             = useState('');
    const [closing_balance, setClosing_balance]             = useState('');
    const [debit_coa, setDebit_coa]                         = useState([]);
    const [credit_coa, setCredit_coa]                       = useState([]);
    const [total_debit_amount, setTotal_debit_amount]       = useState('');
    const [total_credit_amount, setTotal_credit_amount]     = useState('');
    const [voucher_id, setVoucher_id]                       = useState('');
    const [voucher_data, setVoucher_data]                   = useState('');
    const accounts_details                                  = voucher_data.accounts_details || [];

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

    const searchCashBook = ()=> {
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
            const axios = apiUrl.get("/accounts/cash-book/?company="+company+"&branch="+branch+"&starting_date="+starting_date+"&closing_date="+closing_date);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setCompany_info(result_data.data.company)
                    setBranch_info(result_data.data.branch)
                    setStarting_closing_date(result_data.data.starting_closing_date)

                    setOpening_balance(result_data.data.opening_balance);
                    setClosing_balance(result_data.data.closing_balance);
                    setDebit_coa(result_data.data.debit_coa);
                    setCredit_coa(result_data.data.credit_coa);
                    setTotal_debit_amount(result_data.data.total_debit_amount);
                    setTotal_credit_amount(result_data.data.total_credit_amount);
                    setSearchButton(false);
                } else {
                    setCompany_info('')
                    setBranch_info('')
                    setStarting_closing_date('')

                    setOpening_balance('');
                    setClosing_balance('');
                    setDebit_coa([]);
                    setCredit_coa([]);
                    setTotal_debit_amount('');
                    setTotal_credit_amount('');
                    setSearchButton(false);
                }
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    const viewVoucher = (data) => {
        setVoucher_id(data);
        const axios = apiUrl.get("accounts/get-voucher/"+data);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setVoucher_data(result_data.data);
            } else {
                setVoucher_data('');
            }
        }).catch((e) => console.log(e));

        setVoucherModal(true);
    }

    const voucherModalClose = ()=> {
        setVoucherModal(false);
    }

    const printVoucher = (data) => {
        window.open("/voucher/voucher-print/"+data, "Popup", "width=700, height=700");
    }

    useEffect(() => {
        setUser_user_group(user_group);
        companyData();
        branchData();
    }, [company]);

    return (
        <Layout>
            <HeaderTitle title={lang.cash_book} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5 d-print-none">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.cash_book}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/voucher">{lang.accounts_report}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.cash_book}</span>
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
                                        <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${searchButton?'disabled': ''}`} onClick={() => searchCashBook()}>{searchButton?lang.process: lang.search}</button>
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
                                                    <span className='tx-uppercase text-decoration-underline tx-16'>{lang.cash_book}</span>
                                                </th>
                                                <th className="tx-right" width="30%" valign="top">
                                                    {lang.print}: {new Date().toLocaleString("en-in", { day : '2-digit', month: '2-digit', year:'numeric', hour: "2-digit", minute: "2-digit"})}
                                                </th>
                                            </tr>
                                            <tr className="">
                                                <th className="tx-center tx-uppercase" colSpan="3" valign="top">
                                                    From the Date of {new Date(starting_closing_date.starting_date).toLocaleString("en-us", { day : '2-digit', month: 'short', year:'numeric'})} to {new Date(starting_closing_date.closing_date).toLocaleString("en-us", { day : '2-digit', month: 'short', year:'numeric'})}
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
                            {debit_coa.length || credit_coa.length > 0 ?
                            <>
                            <table className="table-striped table-hover table-centered align-middle table-nowrap" width="100%" ref={excelExportRef}>
                                <tbody>
                                    <tr className="text-uppercase">
                                        <th className="tx-left" colSpan={4}>Dr. {lang.debit}</th>
                                    </tr>
                                    <tr className="text-uppercase">
                                        <th className="tx-center bd-all" width="8%">{lang.date}</th>
                                        <th className="tx-center bd-all" width="23%">{lang.particulars} </th>
                                        <th className="tx-center bd-all" width="7%">{lang.voucher_no}</th>
                                        <th className="tx-center bd-all" width="12%">{lang.amount} </th>
                                    </tr>

                                    <tr>
                                        <td className="tx-center bd-left" valign="top">-</td>
                                        <th className="tx-left bd-left" valign="top">Balance b/d (Opening Balance)</th>
                                        <td className="tx-center bd-left" valign="top">-</td>
                                        <th className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={opening_balance} /></th>
                                    </tr>
                                    {debit_coa.length !== 0 && debit_coa.map((debit_row) => (
                                    <>
                                    {debit_row.data.map((row, index) => (
                                    <tr key={index}>
                                    <td className="tx-center bd-left" valign="top">{new Date(row.accounts_details_posting_date).toLocaleString("en-in", { day : '2-digit', month: '2-digit', year:'numeric'})}</td>
                                        <td className="tx-left bd-left" valign="top">{row.chart_of_accounts_code} - {row.chart_of_accounts_name}</td>
                                        <td className="tx-center bd-left" valign="top"><a href="#" onClick={() => viewVoucher(row.accounts_details_accounts)}>{row.accounts_details_voucher_number}</a></td>
                                        <td className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={row.amount} /></td>
                                    </tr>
                                    ))}
                                    </>
                                    ))}
                                    <tr className="bd-left bd-right">
                                        <th className="tx-right text-uppercase bd-all" colSpan={3}>{lang.total} {lang.debit}</th>
                                        <th className="tx-right bd-all">
                                            <AccountsNumberFormat amount={total_debit_amount} />
                                        </th>
                                    </tr>

                                    <tr className="text-uppercase">
                                        <th className="tx-left" colSpan={4}><br/>Cr. {lang.credit}</th>
                                    </tr>
                                    <tr className="text-uppercase">
                                        <th className="tx-center bd-all" width="8%" valign="top">{lang.date}</th>
                                        <th className="tx-center bd-all" width="23%" valign="top">{lang.particulars} </th>
                                        <th className="tx-center bd-all" width="7%" valign="top">{lang.voucher_no}</th>
                                        <th className="tx-center bd-all" width="12%" valign="top">{lang.amount} </th>
                                    </tr>
                                    {credit_coa.length !== 0 && credit_coa.map((credit_row) => (
                                    <>
                                    {credit_row.data.map((row, index) => (
                                    <tr key={index}>
                                    <td className="tx-center bd-left" valign="top">{new Date(row.accounts_details_posting_date).toLocaleString("en-in", { day : '2-digit', month: '2-digit', year:'numeric'})}</td>
                                        <td className="tx-left bd-left" valign="top">{row.chart_of_accounts_code} - {row.chart_of_accounts_name}</td>
                                        <td className="tx-center bd-left" valign="top"><a href="#" onClick={() => viewVoucher(row.accounts_details_accounts)}>{row.accounts_details_voucher_number}</a></td>
                                        <td className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={row.amount} /></td>
                                    </tr>
                                    ))}
                                    </>
                                    ))}

                                    <tr>
                                        <td className="tx-center bd-left" valign="top">-</td>
                                        <th className="tx-left bd-left" valign="top">Balance c/d (Closing Balance)</th>
                                        <td className="tx-center bd-left" valign="top">-</td>
                                        <th className="tx-right bd-left bd-right" valign="top"><AccountsNumberFormat amount={closing_balance} /></th>
                                    </tr>
                                    <tr className="bd-left bd-right">
                                        <th className="tx-right text-uppercase bd-all" colSpan={3}>{lang.total} {lang.credit}</th>
                                        <th className="tx-right bd-all">
                                            <AccountsNumberFormat amount={total_credit_amount} />
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

            {/* Voucher Modal Start*/}
            <div className={`modal fade zoomIn ${voucherModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.view} {lang.voucher}</h6>
                            <button type="button" className="btn-close" onClick={() => voucherModalClose()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12 mt-3">
                                    <h5 className="tx-center tx-bold text-decoration-underline tx-uppercase tx-14">{voucher_data.accounts_voucher_type_name}</h5>

                                    <table className="" width="100%" align="center">
                                        <tbody>
                                            <tr className="text-uppercase">
                                                <th className="tx-left" width="50%">{lang.voucher_no}: {voucher_data.accounts_voucher_number}</th>
                                                <th className="tx-right" width="50%">{lang.date}: {new Date(voucher_data.accounts_posting_date).getDate()}-{new Date(voucher_data.accounts_posting_date).getMonth()+1}-{new Date(voucher_data.accounts_posting_date).getFullYear()}</th>
                                            </tr>
                                        </tbody>
                                    </table><br/>

                                    <table className="" width="100%" align="center">
                                        <tbody>
                                            <tr className="">
                                                <th className="tx-left text-uppercase" width="10%">{lang.narration}: </th>
                                                <th className="tx-left" width="85%">{voucher_data.accounts_narration}</th>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="tx-12 table-success tx-uppercase">
                                        <tr>
                                            <th className="text-center">{lang.sn}</th>
                                            <th className="text-center">{lang.head_of_accounts}</th>
                                            <th className="text-center">{lang.particulars}</th>
                                            <th className="text-center">{lang.debit}</th>
                                            <th className="text-center">{lang.credit}</th>
                                        </tr>
                                    </thead>
                                    {accounts_details.length > 0 ?
                                    <tbody>
                                        {accounts_details.map((row, index) => {
                                        return (
                                        <tr className='' key={row.accounts_details_id}>
                                            <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                            <td className="tx-left">{row.accounts_details_general_ledger_code} - {row.accounts_details_general_ledger_name}</td>
                                            <td className="tx-left">{row.accounts_details_subsidiary_ledger_code} - {row.accounts_details_subsidiary_ledger_name}</td>
                                            <td className="tx-right"><AccountsNumberFormat amount={row.accounts_details_debit} /></td>
                                            <td className="tx-right"><AccountsNumberFormat amount={row.accounts_details_credit} /></td>
                                        </tr>
                                        )})}
                                        <tr className="table-info text-uppercase">
                                            <th className="tx-right" colSpan={3}>{lang.total_amount}</th>
                                            <th className="tx-right"><AccountsNumberFormat amount={voucher_data.accounts_total_debit} /></th>
                                            <th className="tx-right"><AccountsNumberFormat amount={voucher_data.accounts_total_credit} /></th>
                                        </tr>
                                        <tr className="tx-uppercase">
                                            <th className="tx-left" colSpan={5}>
                                                {lang.in_words}: {numberToWords.toWords(voucher_data.accounts_total_debit)} Only.
                                            </th>
                                        </tr>
                                    </tbody>
                                    :
                                    <tbody>
                                        <tr>
                                            <th className="tx-center tx-uppercase text-danger" colSpan="5">{lang.data_not_found}</th>
                                        </tr>
                                    </tbody>
                                    }
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer border-top p-2">
                            <button type="button" className="btn btn-sm btn-info rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => printVoucher(voucher_id)}><i className="fal fa-print"></i> {lang.print}</button>
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => voucherModalClose()}><i className="fal fa-times-circle"></i> {lang.close}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Voucher Modal End*/}
            <ToastContainer />
        </Layout>
    )
}

export default  CashBook;
