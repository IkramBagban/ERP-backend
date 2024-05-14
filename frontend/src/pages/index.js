import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import Layout from '@/components/layout';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import router from 'next/router';
import apiUrl from '@/components/api-url';
import AccountsNumberFormat from '@/components/accounts-number-format';

const Home = ()=> {
    let user_id, user_group, user_group_name, user_name, username, user_id_number, user_designation, user_phone, user_email, user_picture, user_company, user_branch, user_language;
    if (typeof window !== 'undefined') {
        user_id             = localStorage.getItem('user_id');
        user_group          = localStorage.getItem('user_group');
        user_group_name     = localStorage.getItem('user_group_name');
        user_name           = localStorage.getItem('user_name');
        username            = localStorage.getItem('username');
        user_id_number      = localStorage.getItem('user_id_number');
        user_designation    = localStorage.getItem('user_designation');
        user_phone          = localStorage.getItem('user_phone');
        user_email          = localStorage.getItem('user_email');
        user_picture        = localStorage.getItem('user_picture');
        user_company        = localStorage.getItem('user_company');
        user_branch         = localStorage.getItem('user_branch');
        user_language       = localStorage.getItem('user_language');
    }

    const lang = getTranslation();
    const [company, setCompany]             = useState('');
    const [branch, setBranch]               = useState('');
    const [u_group, setU_group]             = useState('');
    const [total_company, setTotal_company] = useState(0);
    const [total_branch, setTotal_branch]   = useState(0);
    const [total_user, setTotal_user]       = useState(0);
    const [cash_balance, setCash_balance]   = useState(0);
    const [bank_balance, setBank_balance]   = useState(0);
    const [u_language, setU_language]       = useState('');
    const [u_picture, setU_picture]         = useState('');
    const [u_name, setU_name]               = useState('');
    const [u_designation, setU_designation] = useState('');

    const [voucher_list, setVoucher_list]               = useState([]);
    const total_debit = voucher_list.reduce((debit, data) => debit + parseFloat((data.accounts_total_debit)), 0);
    const total_credit = voucher_list.reduce((credit, data) => credit + parseFloat((data.accounts_total_credit)), 0);

    const companyCount = () => {
        const axios = apiUrl.get("/company/company-count/");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setTotal_company(result_data.data);
            } else {
                setTotal_company(0);
            }
        }).catch((e) => console.log(e));
    }

    const branchCount = () => {
        let axios;
        if(user_group == 3){
        axios  = apiUrl.get("/branch/branch-count-company/"+company);
        } else {
        axios  = apiUrl.get("/branch/branch-count/");
        }

        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setTotal_branch(result_data.data);
            } else {
                setTotal_branch(0);
            }
        }).catch((e) => console.log(e));
    }

    const userCount = () => {
        let axios;
        if(user_group == 3){
            axios  = apiUrl.get("/users/user-count-company/"+company);
        } else if(user_group == 4){
            axios  = apiUrl.get("/users/user-count-branch?company="+company+"&branch="+branch);
        } else {
            axios  = apiUrl.get("/users/user-count/");
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setTotal_user(result_data.data);
            } else {
                setTotal_user(0);
            }
        }).catch((e) => console.log(e));
    }

    const cashBalance = () => {
        let axios;
        if(user_group == 3){
            axios  = apiUrl.get("/accounts/cash-balance-company/"+company);
        } else {
            axios  = apiUrl.get("/accounts/cash-balance-branch?company="+company+"&branch="+branch);
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCash_balance(result_data.data);
            } else {
                setCash_balance(0);
            }
        }).catch((e) => console.log(e));
    }

    const voucherData = () => {
        const axios = apiUrl.get("/accounts/voucher-list-latest/?company="+company+"&branch="+branch);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setVoucher_list(result_data.data);
            } else {
                setVoucher_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const bankBalance = () => {
        let axios;
        if(user_group == 3){
            axios  = apiUrl.get("/accounts/bank-balance-company/"+company);
        } else {
            axios  = apiUrl.get("/accounts/bank-balance-branch?company="+company+"&branch="+branch);
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setBank_balance(result_data.data);
            } else {
                setBank_balance(0);
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        if(user_group == 1 || user_group == 2){
            companyCount();
        }

        if(user_group == 1 || user_group == 2 || user_group == 3){
            branchCount();
        }

        if(user_group == 3 || user_group == 4){
            cashBalance();
            bankBalance();
        }

        if(user_group == 4){
            voucherData();
        }

        userCount();

        setCompany(user_company);
        setBranch(user_branch);
        setU_group(user_group);
        setU_language(user_language);
        setU_picture(user_picture);
        setU_name(user_name);
        setU_designation(user_designation);
    }, [company, branch]);

    return (
        <Layout>
                <HeaderTitle title={lang.dashboard} keywords="" description=""/>
                <div id="main-wrapper" className="full-page">
                    {/* Breadcrumb Start */}
                    <div className="pageheader pd-t-15 pd-b-15">
                        <div className="d-flex justify-content-between">
                            <div className="clearfix">
                                <div className="pd-t-5 pd-b-5">
                                    <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.dashboard}</h2>
                                </div>
                                <div className="breadcrumb pd-0 mg-0 d-print-none">
                                    <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                    <Link className="breadcrumb-item" href="/">{lang.dashboard}</Link>
                                    {/* <span className="breadcrumb-item hidden-xs active">{lang.dashboard}</span> */}
                                </div>
                            </div>
                            <div className="d-flex align-items-center d-print-none">
                                <button type="button" className="btn btn-success rounded-pill mr-2 pd-t-6-force pd-b-5-force" title="New Faculty" onClick={() => router.push('/voucher/new-voucher')}><i className="fal fa-file-invoice"></i> {lang.new_voucher}</button>&nbsp;
                                <button type="button" className="btn btn-info rounded-pill mr-2 d-none d-none d-lg-block pd-t-6-force pd-b-5-force" title="Print" onClick={() => router.push('/accounts/chart-of-accounts')}><i className="fal fa-bars"></i> {lang.chart_of_accounts}</button>&nbsp;
                                <button type="button" className="btn btn-primary rounded-pill mr-2 d-none d-none d-lg-block pd-t-6-force pd-b-5-force" title="Excel Export" onClick={() => router.push('/accounts-report/ledger-report')}><i className="fal fa-print"></i> {lang.ledger_report}</button>&nbsp;
                            </div>
                        </div>
                    </div>
                    {/* Breadcrumb End */}

                    {/* Content Start */}
                    <div className="row clearfix">
                        <div className="col-md-12 mg-b-15">
                            <div className="bg-success tx-14 tx-bold tx-center">
                                <div className="d-grid gap-2">
                                    <button type="button" className="btn btn-success tx-uppercase">
                                        {lang.welcome_to} {u_name}, {u_designation}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Content End */}

                    {/* Content Start */}
                    {u_group == 1 || u_group == 2?
                    <div className="row clearfix justify-content-center">
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.company}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0">{(total_company).toString().padStart(2, '0')}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.branch}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0">{(total_branch).toString().padStart(2, '0')}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4 col-xl-4">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.users}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0">{(total_user).toString().padStart(2, '0')}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :(u_group == 3)?
                    <div className="row clearfix justify-content-center">
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.cash_in_hand}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0"><AccountsNumberFormat amount={cash_balance} /></h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.cash_at_bank}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0"><AccountsNumberFormat amount={bank_balance} /></h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.branch}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0">{(total_branch).toString().padStart(2, '0')}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-3">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.users}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0">{(total_user).toString().padStart(2, '0')}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :(u_group == 4)?
                    <>
                    <div className="row clearfix justify-content-center">
                        <div className="col-md-6 col-lg-6 col-xl-4">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.cash_in_hand}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0"><AccountsNumberFormat amount={cash_balance} /></h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-4">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.cash_at_bank}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0"><AccountsNumberFormat amount={bank_balance} /></h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-4">
                            <div className="card mg-b-30 bd-success">
                                <div className="card-header d-flex align-items-center justify-content-between bg-success">
                                    <h6 className="card-header-title tx-13 mb-0 tx-white tx-uppercase"></h6>
                                </div>
                                <div className="card-body">
                                    <h5 className="tx-center tx-uppercase tx-spacing-1 tx-semibold tx-12 mg-b-2">{lang.users}</h5>
                                    <div className="">
                                        <h2 className="tx-center tx-20 tx-sm-18 tx-md-24 mg-b-0">{(total_user).toString().padStart(2, '0')}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row clearfix justify-content-center">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered">
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center">{lang.sn}</th>
                                        <th className="tx-center">{lang.date}</th>
                                        <th className="tx-center">{lang.voucher_type}</th>
                                        <th className="tx-center">{lang.voucher_no}</th>
                                        <th className="tx-center">{lang.narration}</th>
                                        <th className="tx-center">{lang.debit}</th>
                                        <th className="tx-center">{lang.credit}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {voucher_list.length> 0 && voucher_list.map((row, index) => (
                                    <tr className='' key={row.accounts_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-center">{row.accounts_posting_date}</td>
                                        <td className="tx-center">{row.accounts_voucher_type_name}</td>
                                        <td className="tx-center">{row.accounts_voucher_number}</td>
                                        <td className="tx-left">{row.accounts_narration}</td>
                                        <td className="tx-right"><AccountsNumberFormat amount={row.accounts_total_debit} /></td>
                                        <td className="tx-right"><AccountsNumberFormat amount={row.accounts_total_credit} /></td>
                                    </tr>
                                    ))}
                                    <tr>
                                        <th className="tx-right tx-uppercase" colSpan={5}>{lang.total}</th>
                                        <th className="tx-right"><AccountsNumberFormat amount={total_debit} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={total_credit} /></th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </>
                    : ''}
                    {/* Content End */}

                    {/* Content Start */}
                    <div className="row clearfix mt-5 justify-content-center">
                        <div className="col-md-12">
                            <div className="mg-b-30">
                                <div className="card-body tx-center">
                                    <Image className="img-fluid wd-80 mg-b-10" src="/assets/images/sam-logo.png" priority={true} alt="" width={70} height={70} />
                                    <p className="tx-uppercase tx-bold tx-16">{lang.software_name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Content End */}
                </div>
        </Layout>
    )
}

export default  Home;
