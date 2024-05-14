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

const TrialBalance = ()=> {
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
        filename        : 'trial-balance',
        sheet           : 'Trial Balance'
    });

    const [user_user_group, setUser_user_group]         = useState('');
    const [warningModal, setWarningModal]               = useState(false);
    const [message, setMassage]                         = useState('');

    const [company_list, setCompany_list]               = useState([]);
    const [branch_list, setBranch_list]                 = useState([]);

    const [company, setCompany]                         = useState(user_company || '');
    const [branch, setBranch]                           = useState(user_branch || '');
    const [closing_date, setClosing_date]               = useState(new Date().toISOString().split('T')[0]);

    const [company_info, setCompany_info]                   = useState('');
    const [branch_info, setBranch_info]                     = useState('');
    const [starting_closing_date, setStarting_closing_date] = useState('');
    const [trial_balance_list, setTrial_balance_list]       = useState([]);
    const [total_balance, setTotal_balance]                 = useState([]);

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
            const axios = apiUrl.get("/accounts/trial-balance/?company="+company+"&branch="+branch+"&closing_date="+closing_date);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setCompany_info(result_data.data.company);
                    setBranch_info(result_data.data.branch);
                    setStarting_closing_date(result_data.data.starting_closing_date);
                    setTrial_balance_list(result_data.data.trial_balance);
                    setTotal_balance(result_data.data.total_balance);
                    setSearchButton(false);
                } else {
                    setCompany_info('');
                    setBranch_info('');
                    setStarting_closing_date('');
                    setTrial_balance_list([]);
                    setTotal_balance('');
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
            <HeaderTitle title={lang.trial_balance} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5 d-print-none">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.trial_balance}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/voucher">{lang.accounts_report}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.trial_balance}</span>
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
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="closing_date">{lang.closing_date}</label>
                                    <input type="date" className="form-control bd-info" id="closing_date" name="closing_date" value={closing_date} onChange={(e) => setClosing_date(e.target.value)} />
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
                                                    <span className='tx-uppercase text-decoration-underline tx-16'>{lang.trial_balance}</span>
                                                </th>
                                                <th className="tx-right" width="30%" valign="top">
                                                    {lang.print}: {new Date().toLocaleString("en-in", { day : '2-digit', month: '2-digit', year:'numeric', hour: "2-digit", minute: "2-digit"})}
                                                </th>
                                            </tr>
                                            <tr className="">
                                                <th className="tx-center tx-uppercase" colSpan="3" valign="top">
                                                    Aa the End of {new Date(starting_closing_date.closing_date).toLocaleString("en-US", { day : '2-digit', month: 'short', year:'numeric'})}
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
                            {trial_balance_list.length > 0 ?
                            <>
                            <table className="table-striped table-hover table-centered align-middle table-nowrap" width="100%" ref={excelExportRef}>
                                <thead>
                                    <tr className="text-uppercase">
                                        <th className="tx-center bd-all" width="60%" rowSpan={2}>{lang.particulars}</th>
                                        <th className="tx-center bd-all" width="20%" colSpan={4}>{lang.balance}</th>
                                    </tr>
                                    <tr className="text-uppercase">
                                        <th className="tx-center bd-all" width="20%" colSpan={2}>{lang.debit}</th>
                                        <th className="tx-center bd-all" width="20%" colSpan={2}>{lang.credit}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trial_balance_list.map((row) => (
                                    <>
                                        <tr key={row.chart_of_accounts_id}>
                                            <th className="tx-left text-uppercase">{row.chart_of_accounts_code} - {row.chart_of_accounts_name}</th>
                                            <th className="tx-right">&nbsp;</th>
                                            <th className="tx-right" width="1%">&nbsp;</th>
                                            <th className="tx-right" width="1%">&nbsp;</th>
                                            <th className="tx-right">&nbsp;</th>
                                        </tr>
                                        {row.accounts_category.map((row) => (
                                        <>
                                            <tr key={row.chart_of_accounts_id}>
                                                <th className="tx-left"> &nbsp;  &nbsp;{row.chart_of_accounts_code} - {row.chart_of_accounts_name}</th>
                                                <th className="tx-right bd-all"><AccountsNumberFormat amount={row.balance.debit_balance} /></th>
                                                    <th className="tx-right" width="1%">&nbsp;</th>
                                                    <th className="tx-right" width="1%">&nbsp;</th>
                                                    <th className="tx-right bd-all"><AccountsNumberFormat amount={row.balance.credit_balance} /></th>
                                            </tr>
                                            {row.control_group.map((row) => (
                                            <>
                                                {/* <tr key={row.chart_of_accounts_id}>
                                                    <th className="tx-left"> &nbsp;  &nbsp; &nbsp;  &nbsp;{row.chart_of_accounts_code} - {row.chart_of_accounts_name}</th>
                                                    <th className="tx-right"><AccountsNumberFormat amount={row.balance.debit_balance} /></th>
                                                    <th className="tx-right" width="1%">&nbsp;</th>
                                                    <th className="tx-right" width="1%">&nbsp;</th>
                                                    <th className="tx-right"><AccountsNumberFormat amount={row.balance.credit_balance} /></th>
                                                </tr> */}
                                                {row.general_ledger.map((row) => (
                                                    <tr key={row.chart_of_accounts_id}>
                                                        <td className="tx-left"> &nbsp;  &nbsp; &nbsp;  &nbsp;{row.chart_of_accounts_code} - {row.chart_of_accounts_name}</td>
                                                        <td className="tx-right"><AccountsNumberFormat amount={row.balance.debit_balance} /></td>
                                                        <td className="tx-right" width="1%">&nbsp;</td>
                                                        <td className="tx-right" width="1%">&nbsp;</td>
                                                        <td className="tx-right"><AccountsNumberFormat amount={row.balance.credit_balance} /></td>
                                                    </tr>
                                                ))}
                                            </>
                                            ))}
                                        </>
                                        ))}
                                    </>
                                    ))}
                                    <tr className="text-uppercase">
                                        <th className="tx-right" colSpan={5}>&nbsp;</th>
                                    </tr>
                                    <tr className="text-uppercase">
                                        <th className="tx-right"> {lang.total} &nbsp;</th>
                                        <th className="tx-right bd-top bd-bottom-double"><AccountsNumberFormat amount={total_balance.debit_balance} /></th>
                                        <th className="tx-right" width="1%">&nbsp;</th>
                                        <th className="tx-right" width="1%">&nbsp;</th>
                                        <th className="tx-right bd-top bd-bottom-double"><AccountsNumberFormat amount={total_balance.credit_balance} /></th>
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
                        <div className="modal-footer border-top p-2">
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

export default  TrialBalance;
