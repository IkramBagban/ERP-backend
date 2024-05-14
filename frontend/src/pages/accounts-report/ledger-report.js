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

const LedgerReport = ()=> {
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
        filename        : 'ledger-report',
        sheet           : 'Ledger Report'
    });

    const [user_user_group, setUser_user_group]         = useState('');
    const [warningModal, setWarningModal]               = useState(false);
    const [voucherModal, setVoucherModal]               = useState(false);
    const [message, setMassage]                         = useState('');

    const [company_list, setCompany_list]               = useState([]);
    const [branch_list, setBranch_list]                 = useState([]);

    const [cg_coa_list, setCG_coa_list]                 = useState([]);
    const [gl_coa_list, setGL_coa_list]                 = useState([]);
    const [sl_coa_list, setSL_coa_list]                 = useState([]);

    const [company, setCompany]                         = useState(user_company || '');
    const [branch, setBranch]                           = useState(user_branch || '');
    const [control_group, setControl_group]             = useState('');
    const [general_ledger, setGeneral_ledger]           = useState('');
    const [subsidiary_ledger, setSubsidiary_ledger]     = useState('');
    const [starting_date, setStarting_date]             = useState(new Date().toISOString().split('T')[0]);
    const [closing_date, setClosing_date]               = useState(new Date().toISOString().split('T')[0]);

    const [company_info, setCompany_info]                   = useState('');
    const [branch_info, setBranch_info]                     = useState('');
    const [starting_closing_date, setStarting_closing_date] = useState('');
    const [opening_balance, setOpening_balance]             = useState('');
    const [sub_total_balance, setSub_total_balance]         = useState('');
    const [closing_balance, setClosing_balance]             = useState('');
    const [ledger_coa_list, setLedger_coa_list]             = useState([]);
    const [control_group_data, setControl_group_data]       = useState('');
    const [general_ledger_data, setGeneral_ledger_data]     = useState('');
    const [subsidiary_ledger_data, setSubsidiary_ledger_data]= useState('');
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

    const coaCGData = () => {
        const axios = apiUrl.get("/chart-of-accounts/get-chart-of-accounts-control-group/"+company);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCG_coa_list(result_data.data);
            } else {
                setCG_coa_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const coaGLData = () => {
        if(control_group > 0) {
            const axios = apiUrl.get("/chart-of-accounts/get-chart-of-accounts-category/"+control_group);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setGL_coa_list(result_data.data);
                } else {
                    setGL_coa_list([]);
                }
            }).catch((e) => console.log(e));
        }
    }

    const coaSLData = () => {
        if(general_ledger > 0) {
            const axios = apiUrl.get("/chart-of-accounts/get-chart-of-accounts-category/"+general_ledger);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setSL_coa_list(result_data.data);
                } else {
                    setSL_coa_list([]);
                }
            }).catch((e) => console.log(e));
        }
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
            const axios = apiUrl.get("/accounts/ledger-report/?company="+company+"&branch="+branch+"&control_group="+control_group+"&general_ledger="+general_ledger+"&subsidiary_ledger="+subsidiary_ledger+"&starting_date="+starting_date+"&closing_date="+closing_date);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setCompany_info(result_data.data.company);
                    setBranch_info(result_data.data.branch);
                    setStarting_closing_date(result_data.data.starting_closing_date);
                    setOpening_balance(result_data.data.opening_balance);
                    setSub_total_balance(result_data.data.sub_total_balance);
                    setClosing_balance(result_data.data.closing_balance);
                    setLedger_coa_list(result_data.data.coa_data);
                    setControl_group_data(result_data.data.control_group_data);
                    setGeneral_ledger_data(result_data.data.general_ledger_data);
                    setSubsidiary_ledger_data(result_data.data.subsidiary_ledger_data);
                    setSearchButton(false);
                } else {
                    setCompany_info('');
                    setBranch_info('');
                    setStarting_closing_date('');
                    setOpening_balance('');
                    setSub_total_balance('');
                    setClosing_balance('');
                    setLedger_coa_list([]);
                    setControl_group_data('');
                    setGeneral_ledger_data('');
                    setSubsidiary_ledger_data('');
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
        coaCGData();
        coaGLData();
        coaSLData();
        companyData();
        branchData();
    }, [company, control_group, general_ledger]);

    return (
        <Layout>
            <HeaderTitle title={lang.ledger_report} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5 d-print-none">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.ledger_report}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/accounts-report">{lang.accounts_report}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.ledger_report}</span>
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
                        <div className="row clearfix d-print-none">
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
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="starting_date">{lang.from_date}</label>
                                    <input type="date" className="form-control bd-info" id="starting_date" name="starting_date" value={starting_date} onChange={(e) => setStarting_date(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="closing_date">{lang.to_date}</label>
                                    <input type="date" className="form-control bd-info" id="closing_date" name="closing_date" value={closing_date} onChange={(e) => setClosing_date(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="control_group">{lang.control_group}</label>
                                    <select type="text" className="form-control bd-info" id="control_group" name="control_group" value={control_group} onChange={(e) => setControl_group(e.target.value)}>
                                        <option value="0">{lang.select}</option>
                                        {cg_coa_list.map(row => (
                                        <option key={row.chart_of_accounts_id} value={row.chart_of_accounts_id}>{row.chart_of_accounts_name} ({row.chart_of_accounts_code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="general_ledger">{lang.general_ledger}</label>
                                    <select type="text" className="form-control bd-info" id="general_ledger" name="general_ledger" value={general_ledger} onChange={(e) => setGeneral_ledger(e.target.value)}>
                                    <option value="">{lang.select}</option>
                                    <option value="0">All</option>
                                        {gl_coa_list.map(row => (
                                        <option key={row.chart_of_accounts_id} value={row.chart_of_accounts_id}>{row.chart_of_accounts_name} ({row.chart_of_accounts_code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="subsidiary_ledger">{lang.subsidiary_ledger}</label>
                                    <select type="text" className="form-control bd-info" id="subsidiary_ledger" name="subsidiary_ledger" value={subsidiary_ledger} onChange={(e) => setSubsidiary_ledger(e.target.value)}>
                                    <option value="">{lang.select}</option>
                                    <option value="0">All</option>
                                        {sl_coa_list.map(row => (
                                        <option key={row.chart_of_accounts_id} value={row.chart_of_accounts_id}>{row.chart_of_accounts_name}  ({row.chart_of_accounts_code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
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
                                                <span className='tx-uppercase text-decoration-underline tx-16'>{lang.ledger_report}</span>
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
                            : (ledger_coa_list.length > 0)? <>
                            <table className="table-hover" width="100%" border="0">
                                <tbody>
                                    {control_group_data.chart_of_accounts_id > 0?
                                    <tr>
                                        <th className="tx-left" width="19%">
                                            {lang.control_group}
                                        </th>
                                        <th className="tx-left" width="1%">
                                            :
                                        </th>
                                        <th className="tx-left" width="80%">
                                            {control_group_data.chart_of_accounts_name} ({control_group_data.chart_of_accounts_code})
                                        </th>
                                    </tr>
                                    : ''}
                                    {general_ledger_data.chart_of_accounts_id > 0?
                                    <tr>
                                        <th className="tx-left" width="19%">
                                            {lang.general_ledger}
                                        </th>
                                        <th className="tx-left" width="1%">
                                            :
                                        </th>
                                        <th className="tx-left" width="80%">
                                            {general_ledger_data.chart_of_accounts_name} ({general_ledger_data.chart_of_accounts_code})
                                        </th>
                                    </tr>
                                    : ''}
                                    {subsidiary_ledger_data.chart_of_accounts_id > 0?
                                    <tr>
                                        <th className="tx-left" width="19%">
                                            {lang.subsidiary_ledger}
                                        </th>
                                        <th className="tx-left" width="1%">
                                            :
                                        </th>
                                        <th className="tx-left" width="80%">
                                            {subsidiary_ledger_data.chart_of_accounts_name} ({subsidiary_ledger_data.chart_of_accounts_code})
                                        </th>
                                    </tr>
                                    : ''}
                                </tbody>
                            </table>
                            <table className="table table-bordered table-striped table-hover" width="100%" ref={excelExportRef}>
                                <thead>
                                    <tr className="text-uppercase">
                                        <th className="tx-center bd-all">{lang.date} </th>
                                        <th className="tx-center bd-all">{lang.accounts_head}</th>
                                        <th className="tx-center bd-all">{lang.particulars}</th>
                                        <th className="tx-center bd-all">{lang.voucher} </th>
                                        <th className="tx-center bd-all">{lang.debit} </th>
                                        <th className="tx-center bd-all">{lang.credit} </th>
                                        <th className="tx-center bd-all">{lang.balance} </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="tx-left"></td>
                                        <td className="tx-left" colSpan={2}>Opening Balance</td>
                                        <td className="tx-center">-</td>
                                        <td className="tx-right"><AccountsNumberFormat amount={opening_balance.debit_balance} /></td>
                                        <td className="tx-right"><AccountsNumberFormat amount={opening_balance.credit_balance} /></td>
                                        <td className="tx-right"><AccountsNumberFormat amount={opening_balance.net_balance} /></td>
                                    </tr>
                                    {
                                    ledger_coa_list.length !== 0 && ledger_coa_list.map((coa_row) => (
                                    <>
                                        {coa_row.data.map((row, index) => (
                                        <tr key={index}>
                                            <td className="tx-center">{new Date(row.accounts_details_posting_date).toLocaleString('en-in', {day:'2-digit', month:'2-digit', year:'numeric'})}</td>
                                            <td className="tx-left">{coa_row.chart_of_accounts_code} - {coa_row.chart_of_accounts_name}</td>
                                            <td className="tx-left">{row.chart_of_accounts_code} - {row.chart_of_accounts_name}</td>
                                            <td className="tx-center"><a href="#" onClick={() => viewVoucher(row.accounts_details_accounts)}>{row.accounts_details_voucher_number}</a></td>
                                            <td className="tx-right"><AccountsNumberFormat amount={row.accounts_details_debit} /></td>
                                            <td className="tx-right"><AccountsNumberFormat amount={row.accounts_details_credit} /></td>
                                            <td className="tx-right"><AccountsNumberFormat amount={row.accounts_details_balance} /></td>
                                        </tr>
                                        ))}
                                    </>
                                    ))}
                                    <tr className="">
                                        <th className="tx-right text-uppercase" colSpan={4}>{lang.sub_total}</th>
                                        <th className="tx-right"><AccountsNumberFormat amount={sub_total_balance.debit_balance} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={sub_total_balance.credit_balance} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={sub_total_balance.net_balance} /></th>
                                    </tr>
                                    <tr className="">
                                        <th className="tx-right text-uppercase" colSpan={4}>{lang.total}</th>
                                        <th className="tx-right"><AccountsNumberFormat amount={closing_balance.debit_balance} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={closing_balance.credit_balance} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={closing_balance.net_balance} /></th>
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
                            :""}
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

export default  LedgerReport;
