import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import Layout from '@/components/layout';
import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import router from 'next/router';
import AccountsNumberFormat from '@/components/accounts-number-format';

import numberToWords from 'number-to-words';
const EditVoucher = ({data})=> {
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

    const [submitButton, setSubmitButton]                   = useState(false);
    const [warningModal, setWarningModal]                   = useState(false);
    const [successModal, setSuccessModal]                   = useState(false);
    const [voucherModal, setVoucherModal]                   = useState(false);
    const [message, setMassage]                             = useState('');

    const [voucher_id, setVoucher_id]                       = useState('');
    const [voucher_data, setVoucher_data]                   = useState('');
    const accounts_details                                  = voucher_data.accounts_details || [];

    const [company, setCompany]                             = useState(user_company ||'');
    const [branch, setBranch]                               = useState(user_branch ||'');
    const [posting_date, setPosting_date]                   = useState(new Date().toISOString().split('T')[0]);
    const [voucher_type, setVoucher_type]                   = useState('');
    const [narration, setNarration]                         = useState('');
    const [accounts_head, setAccounts_head]                 = useState('');
    const [total_debit, setTotal_debit]                     = useState(0);
    const [total_credit, setTotal_credit]                   = useState(0);

    const [company_list, setCompany_list]                   = useState([]);
    const [branch_list, setBranch_list]                     = useState([]);
    const [voucher_type_list, setVoucher_type_list]         = useState([]);
    const [coa_list, setCOA_list]                           = useState([]);
    const [accounts_list, setAccounts_list]                 = useState([]);

    const formSubmit = (e, v_id) => {
        e.preventDefault();
        setSubmitButton(true);

        if(company <= 0) {
            setMassage(lang.company_select_warning);
            setWarningModal(true);
            setSubmitButton(false);
        } else if(branch <= 0) {
            setMassage(lang.branch_select_warning);
            setWarningModal(true);
            setSubmitButton(false);
        } else if(posting_date.length <= 0) {
            setMassage(lang.date_select_warning);
            setWarningModal(true);
            setSubmitButton(false);
        } else if(voucher_type <= 0) {
            setMassage(lang.voucher_type_select_warning);
            setWarningModal(true);
            setSubmitButton(false);
        } else if(accounts_list.length <= 1) {
            setMassage(lang.minimum_two_rows_posting);
            setWarningModal(true);
            setSubmitButton(false);
        } else if(total_debit == 0 && total_credit == 0){
            setMassage(lang.debit_credit_does_not_zero);
            setWarningModal(true);
            setSubmitButton(false);
        } else if(total_debit !== total_credit){
            setMassage(lang.debit_credit_does_not_match);
            setWarningModal(true);
            setSubmitButton(false);
        } else {
            const accountsFormData = {
                accounts_company        : company,
                accounts_branch         : branch,
                accounts_posting_date   : posting_date,
                accounts_voucher_type   : voucher_type,
                accounts_narration      : narration,
                accounts_total_debit    : total_debit,
                accounts_total_credit   : total_credit
            }

            const axios = apiUrl.put("/accounts/voucher-update/"+v_id,{accountsFormData, accounts_list})

            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    // setMassage(lang.data_insert_success);
                    setMassage(result_data.message);
                    setVoucher_id(result_data.data.accounts_id)
                    setSuccessModal(true);
                    setSubmitButton(false);

                    // setPosting_date(new Date().toISOString().split('T')[0]);
                    // setVoucher_type('');
                    // setNarration('');
                    // setAccounts_list([]);
                } else {
                    // setMassage(lang.data_insert_error);
                    setMassage(result_data.message);
                    setWarningModal(true);
                    setSubmitButton(false);
                }
            }).catch((e) => console.log(e));
        }

    }

    const addCartItem = (coa_id, coa_code, coa_name, coa_code_gl, coa_name_gl, debit, credit) => {
        const items = {
            coa_id      : coa_id,
            coa_code    : coa_code,
            coa_name    : coa_name,
            coa_code_gl : coa_code_gl,
            coa_name_gl : coa_name_gl,
            debit       : parseFloat(debit) || 0,
            credit      : parseFloat(credit) || 0
        }
        setAccounts_list([...accounts_list, items]);

        setTotal_debit(parseFloat([...accounts_list, items].reduce((acc, item) => acc + item.debit, 0)));
        setTotal_credit(parseFloat([...accounts_list, items].reduce((acc, item) => acc + item.credit, 0)));

        setAccounts_head('');
    };

    const editCartItem = (coa_id, coa_code, coa_name, coa_code_gl, coa_name_gl, debit, credit) => {
        const items = {
            coa_id      : coa_id,
            coa_code    : coa_code,
            coa_name    : coa_name,
            coa_code_gl : coa_code_gl,
            coa_name_gl : coa_name_gl,
            debit       : parseFloat(debit) || 0,
            credit      : parseFloat(credit) || 0
        }
        // setGet_item(items);

        const updatedArray = accounts_list.map((data) =>
            data.coa_id === coa_id ? items : data
        );
        setAccounts_list(updatedArray);
        setTotal_debit(parseFloat(updatedArray.reduce((acc, item) => acc + item.debit, 0)));
        setTotal_credit(parseFloat(updatedArray.reduce((acc, item) => acc + item.credit, 0)));

        setAccounts_head('');
    };

    const deleteCartItem = (coa_id) => {
        const deleteArray = accounts_list.filter((data) => data.coa_id !== coa_id);
        setAccounts_list(deleteArray);

        setTotal_debit(parseFloat(deleteArray.reduce((acc, item) => acc + item.debit, 0)));
        setTotal_credit(parseFloat(deleteArray.reduce((acc, item) => acc + item.credit, 0)));

        setAccounts_head('');
    }

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

    const voucher_typeData = () => {
        const axios = apiUrl.get("/voucher-type/voucher-type-list-active");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setVoucher_type_list(result_data.data);

            } else {
                setVoucher_type_list([]);

            }
        }).catch((e) => console.log(e));
    }

    const coaData = () => {
        const axios = apiUrl.get("chart-of-accounts/chart-of-accounts-search?company="+company+"&search="+accounts_head);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCOA_list(result_data.data);
            } else {
                setCOA_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const viewVoucher = (data) => {
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

    const voucherData = ()=>{
        const axios = apiUrl.get("/accounts/get-voucher/"+data);
        axios.then((response) => {
            const result = response.data;
            const result_data = result.data;
            if(result.status == 1){
                // setVoucher_data(result_data);
                setVoucher_id(result_data.accounts_id);
                setCompany(result_data.accounts_company);
                setBranch(result_data.accounts_branch);
                setPosting_date(result_data.accounts_posting_date);
                setVoucher_type(result_data.accounts_voucher_type);
                setNarration(result_data.accounts_narration);

                const accounts_details_data = result_data.accounts_details.map((row_data) => ({
                    coa_id          : row_data.accounts_details_subsidiary_ledger,
                    coa_code        : row_data.accounts_details_subsidiary_ledger_code,
                    coa_name        : row_data.accounts_details_subsidiary_ledger_name,
                    coa_code_gl     : row_data.accounts_details_general_ledger_code,
                    coa_name_gl     : row_data.accounts_details_general_ledger_name,
                    debit           : parseFloat(row_data.accounts_details_debit) || 0,
                    credit          : parseFloat(row_data.accounts_details_credit) || 0,
                })) || [];

                setAccounts_list(accounts_details_data);
                setTotal_debit(parseFloat(result_data.accounts_total_debit));
                setTotal_credit(parseFloat(result_data.accounts_total_credit));
            } else {
                setVoucher_id('');
                setVoucher_data('');
                setCompany('');
                setBranch('');
                setPosting_date('');
                setVoucher_type('');
                setNarration('');

                setAccounts_list([]);
                setTotal_debit(0);
                setTotal_credit(0);
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        voucherData();
    }, []);

    useEffect(() => {
        companyData();
        branchData();
        voucher_typeData();
        coaData();
    }, [company, accounts_head]);

    return (
        <Layout>
            <HeaderTitle title={lang.edit_voucher} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.edit_voucher}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/voucher">{lang.voucher}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.edit_voucher}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            <Link className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.voucher_list} href="/voucher/voucher-list"><i className="fal fa-list"></i></Link>
                            <button type="button" className="btn btn-danger rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.close} onClick={()=> window.close()}><i className="fal fa-times"></i></button>
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
                                    <select type="text" className="form-control bd-danger" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)}>
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
                                    <select type="text" className="form-control bd-danger" id="branch" name="branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {branch_list.map(branch_row => (
                                        <option key={branch_row.branch_id} value={branch_row.branch_id}>{branch_row.branch_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="posting_date">{lang.posting_date}</label>
                                    <input type="date" className="form-control bd-danger" id="posting_date" name="posting_date" value={posting_date} onChange={(e) => setPosting_date(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="voucher_type">{lang.voucher_type}</label>
                                    <select type="text" className="form-control bd-danger" id="voucher_type" name="voucher_type" value={voucher_type} onChange={(e) => setVoucher_type(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {voucher_type_list.map(vt_row => (
                                        <option key={vt_row.voucher_type_id} value={vt_row.voucher_type_id}>{vt_row.voucher_type_code} - {vt_row.voucher_type_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-6 mt-3">
                                <div className="form-group">
                                    <input type="text" className="form-control form-control-lg bd-info" id="narration" name="narration" value={narration} placeholder={lang.narration} onChange={(e) => setNarration(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div className="input-group mb-3">
                                    <div className="input-group">
                                        <label className="input-group-text bd-info text-danger" htmlFor="accounts_head"><i className="far fa-search tx-18"></i></label>
                                        <input type="text" className="form-control form-control-lg bd-info tx-uppercase tx-center" id="accounts_head" name="accounts_head" value={accounts_head} placeholder="Search by Accounts Code or Name" onChange={(e) => setAccounts_head(e.target.value)} autoCapitalize="off" />
                                    </div>
                                    <div className={`custom-search-list d-block ${accounts_head? 'd-block' : 'd-none'} `}>
                                        <ul className="nav flex-column">
                                            {coa_list.map((row) => (
                                            <li className="nav-item" key={row.chart_of_accounts_id}>
                                                <Link href="#" className={`nav-link ${(row.chart_of_accounts_id) <= 0? 'disabled': ''}`} onClick={() => addCartItem(row.chart_of_accounts_id, row.chart_of_accounts_code, row.chart_of_accounts_name, row.chart_of_accounts_code_gl, row.chart_of_accounts_name_gl, 0, 0)} >{row.chart_of_accounts_code_gl} - {row.chart_of_accounts_name_gl} {'>'} {row.chart_of_accounts_code} - {row.chart_of_accounts_name}</Link>
                                            </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive" style={{minHeight: '250px'}}>
                            <table className="table table-striped table-bordered">
                                <thead className="tx-uppercase table-success">
                                    <tr>
                                        <th className="tx-center" width="5%">{lang.sn}</th>
                                        <th className="tx-center" width="50%">{lang.head_of_accounts}</th>
                                        <th className="tx-center" width="20%">{lang.debit}</th>
                                        <th className="tx-center" width="20%">{lang.credit}</th>
                                        <th className="tx-center" width="5%">#</th>
                                    </tr>
                                </thead>
                                {accounts_list.length > 0 ?
                                <tbody>
                                    {accounts_list.map((row, index) => (
                                    <tr key={row.coa_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-left">
                                            {row.coa_code_gl} - {row.coa_name_gl} {'>'} {row.coa_code} - {row.coa_name}
                                        </td>
                                        <th className="tx-center">
                                            <input type="text" className="form-control bd-info tx-right" id="debit" name="debit" value={row.debit} onChange={(e) => editCartItem(row.coa_id, row.coa_code, row.coa_name, row.coa_code_gl, row.coa_name_gl, e.target.value, row.credit)} />
                                        </th>
                                        <th className="tx-center">
                                            <input type="text" className="form-control bd-info tx-right" id="credit" name="credit" value={row.credit} onChange={(e) => editCartItem(row.coa_id, row.coa_code, row.coa_name, row.coa_code_gl, row.coa_name_gl, row.debit, e.target.value)} />
                                        </th>
                                        <th className="tx-center">
                                            <button type="button" className="btn btn-outline-danger rounded-pill pd-t-6-force pd-b-5-force mg-r-3" onClick={ ()=> deleteCartItem(row.coa_id)}><i className="fal fa-times"></i></button>
                                        </th>
                                    </tr>
                                    ))}

                                    <tr className="table-success">
                                        <th className="tx-right tx-uppercase" colSpan="2">
                                            {lang.total_amount}
                                        </th>
                                        <th className="tx-right">
                                            <AccountsNumberFormat amount={total_debit} />&nbsp;&nbsp;
                                        </th>
                                        <th className="tx-right">
                                            <AccountsNumberFormat amount={total_credit} />&nbsp;&nbsp;
                                        </th>
                                        <th className="tx-center"></th>
                                    </tr>

                                    <tr>
                                        <th className="tx-center" colSpan="2"></th>
                                        <th className="tx-center" colSpan="2">
                                        <div className="d-grid gap-2">
                                            <button type="button" className={`btn btn-success rounded-pill pd-t-6-force pd-b-5-force tx-uppercase ${submitButton?'disabled': ''}`} onClick={(e)=> formSubmit(e, voucher_id)}>{submitButton?lang.process: lang.save}</button>
                                        </div>
                                        </th>
                                        <th className="tx-center"></th>
                                    </tr>

                                </tbody>
                                : ''}
                            </table>
                        </div>
                    </div>
                </div>
                {/* Content End */}
            </div>

            {/* Warning Modal Start*/}
            <div className={`modal fade ${successModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-success m-0 p-2">
                            <h6 className="modal-title text-white"> </h6>
                            <button type="button" className="btn-close" onClick={() => setSuccessModal()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tx-center tx-50 tx-success">
                                        <i className="fal fa-check-circle"></i>
                                    </div>
                                    <h4 className="tx-success tx-uppercase tx-13 tx-center">{message}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top p-2">
                            <button type="button" className="btn btn-sm btn-primary rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => viewVoucher(voucher_id)}><i className="fal fa-eye"></i> {lang.view}</button>
                            <button type="button" className="btn btn-sm btn-info rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => printVoucher(voucher_id)}><i className="fal fa-print"></i> {lang.print}</button>
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => setSuccessModal(false)}><i className="fal fa-times-circle"></i> {lang.close}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Warning Modal End*/}

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

            {/* Voucher Modal Start*/}
            <div className={`modal fade zoomIn ${voucherModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg">
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
        </Layout>
    )
}


export const getServerSideProps = async (context) => {
    const data = context.params.voucher_id;
    return {
        props:{
            data
        }
    }
}

export default  EditVoucher;