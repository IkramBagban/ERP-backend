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
import numberToWords from 'number-to-words';

const VoucherList = ()=> {
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
        filename        : 'voucher-list',
        sheet           : 'Voucher List'
    });

    const [user_user_group, setUser_user_group]         = useState('');
    const [warningModal, setWarningModal]               = useState(false);
    const [voucherModal, setVoucherModal]               = useState(false);
    const [message, setMassage]                         = useState('');
    const [showFormModalDelete, setShowFormModalDelete] = useState(false);

    const [company_list, setCompany_list]               = useState([]);
    const [branch_list, setBranch_list]                 = useState([]);
    const [voucher_type_list, setVoucher_type_list]     = useState([]);
    const status_list = [
        {
            status_id:1,
            status_code: 'A',
            status_name: 'Active'
        },
        {
            status_id:0,
            status_code: 'I',
            status_name: 'Inactive'
        }
    ];

    const [voucher_id, setVoucher_id]                       = useState('');
    const [voucher_data, setVoucher_data]                   = useState('');
    const accounts_details                                  = voucher_data.accounts_details || [];

    const [company, setCompany]                         = useState(user_company || '');
    const [branch, setBranch]                           = useState(user_branch || '');
    const [from_date, setFrom_date]                     = useState(new Date().toISOString().split('T')[0]);
    const [to_date, setTo_date]                         = useState(new Date().toISOString().split('T')[0]);
    const [voucher_number, setVoucher_number]           = useState('');
    const [voucher_type, setVoucher_type]               = useState('all');
    const [status, setStatus]                           = useState('all');

    const [voucher_list, setVoucher_list]               = useState([]);
    const total_debit = voucher_list.reduce((debit, data) => debit + parseFloat((data.accounts_total_debit)), 0);
    const total_credit = voucher_list.reduce((credit, data) => credit + parseFloat((data.accounts_total_credit)), 0);

    const formModalDelete = (primary_id) => {
        setVoucher_id(primary_id);
        setShowFormModalDelete(true);
    }

    const FormModalDeleteClose = () => {
        setVoucher_id('');

        setShowFormModalDelete(false);
    }

    const formSubmitDelete = (delete_id) => {
        const axios = apiUrl.delete("/accounts/voucher-delete/"+delete_id,)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const deleteArray = voucher_list.filter((data) => data.accounts_id !== delete_id);
                setVoucher_list(deleteArray);
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
                setVoucher_id(0);
                setShowFormModalDelete(false);
            } else {
                setTimeout(() => {
                    toast.error(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                    });
                }, 300);
            }
        }).catch((e) => console.log(e));
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

    const searchVoucher = ()=> {
        setSearchButton(true);
        if(company <= 0) {
            setMassage(lang.company_select_warning);
            setWarningModal(true);
            setSearchButton(false);
        } else if(branch <= 0) {
            setMassage(lang.branch_select_warning);
            setWarningModal(true);
            setSearchButton(false);
        } else {
            const axios = apiUrl.get("/accounts/voucher-list/?company="+company+"&branch="+branch+"&from_date="+from_date+"&to_date="+to_date+"&voucher_number="+voucher_number+"&voucher_type="+voucher_type+"&status="+status);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setVoucher_list(result_data.data);
                    setSearchButton(false);
                } else {
                    setVoucher_list([]);
                    setSearchButton(false);
                }
            }).catch((e) => console.log(e));
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
        voucher_typeData();
    }, [company]);

    return (
        <Layout>
            <HeaderTitle title={lang.voucher_list} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.voucher_list}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/voucher">{lang.voucher}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.voucher_list}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            {user_user_group == 1 || user_user_group == 2 || user_user_group == 3 || user_user_group == 4?
                            <Link className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" href="/voucher/new-voucher" title={lang.new_voucher}><i className="fal fa-plus"></i></Link>
                            :''}
                            <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.print} onClick={() => window.print()}><i className="fal fa-print"></i></button>
                            <button type="button" className="btn btn-info rounded-pill pd-t-6-force pd-b-5-force" title={lang.excel_export} onClick={onDownload}><i className="fal fa-file-excel"></i></button>
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
                                        {branch_list.map(branch_row => (
                                        <option key={branch_row.branch_id} value={branch_row.branch_id}>{branch_row.branch_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="from_date">{lang.from_date}</label>
                                    <input type="date" className="form-control bd-info" id="from_date" name="from_date" value={from_date} onChange={(e) => setFrom_date(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="to_date">{lang.to_date}</label>
                                    <input type="date" className="form-control bd-info" id="search" name="to_date" value={to_date} onChange={(e) => setTo_date(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="voucher_number">{lang.voucher_no}</label>
                                    <input type="text" className="form-control bd-info" id="voucher_number" name="voucher_number" value={voucher_number} onChange={(e) => setVoucher_number(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="voucher_type">{lang.voucher_type}</label>
                                    <select type="text" className="form-control bd-info" id="voucher_type" name="voucher_type" value={voucher_type} onChange={(e) => setVoucher_type(e.target.value)}>
                                        <option value="all">All</option>
                                        {voucher_type_list.map(voucher_type_row => (
                                        <option key={voucher_type_row.voucher_type_id} value={voucher_type_row.voucher_type_id}>{voucher_type_row.voucher_type_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="status">{lang.status}</label>
                                    <select type="text" className="form-control bd-info" id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                        <option value="all">All</option>
                                        {status_list.map(status_row => (
                                        <option key={status_row.status_id} value={status_row.status_id}>{status_row.status_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="search">&nbsp;</label>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${searchButton?'disabled': ''}`} onClick={() => searchVoucher()}>{searchButton?lang.process: lang.search}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered" ref={excelExportRef}>
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center">{lang.sn}</th>
                                        <th className="tx-center">{lang.date}</th>
                                        <th className="tx-center">{lang.voucher_type}</th>
                                        <th className="tx-center">{lang.voucher_no}</th>
                                        <th className="tx-center">{lang.narration}</th>
                                        <th className="tx-center">{lang.debit}</th>
                                        <th className="tx-center">{lang.credit}</th>
                                        <th className="tx-center">{lang.status}</th>
                                        <th className="tx-center d-print-none">{lang.option}</th>
                                    </tr>
                                </thead>
                                {searchButton?
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none" colSpan="9">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                                :
                                <tbody>
                                    {voucher_list.map((row, index) => {
                                    return (
                                    <tr className='' key={row.accounts_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-center">{new Date(row.accounts_posting_date).toLocaleString('en-in', {day: '2-digit', month:'2-digit', year: 'numeric'})}</td>
                                        <td className="tx-center">{row.accounts_voucher_type_name}</td>
                                        <td className="tx-center">{row.accounts_voucher_number}</td>
                                        <td className="tx-left">{row.accounts_narration}</td>
                                        <td className="tx-right"><AccountsNumberFormat amount={row.accounts_total_debit} /></td>
                                        <td className="tx-right"><AccountsNumberFormat amount={row.accounts_total_credit} /></td>
                                        <td className="tx-center">{row.accounts_status==1?lang.active:lang.inactive}</td>
                                        <td className="tx-center d-print-none">
                                            <Link className="text-warning mg-r-3" href="#" title={lang.branch} onClick={() => viewVoucher(row.accounts_id)}><i className="fas fa-eye wd-16 mr-2"></i></Link>
                                            {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                            <Link className="text-primary mg-r-3" href={`/voucher/voucher-edit/${row.accounts_id}`} title={lang.edit} target="_blank"><i className="fas fa-pencil wd-16 mr-2"></i></Link>
                                            : ''}
                                            {user_user_group == 1 ?
                                            <Link className="text-danger" href="#" title={lang.remove} onClick={() => formModalDelete(row.accounts_id)}><i className="fas fa-times wd-16 mr-2"></i></Link>
                                            :''}
                                        </td>
                                    </tr>
                                    )})}
                                    <tr>
                                        <th className="tx-right tx-uppercase" colSpan={5}>{lang.total}</th>
                                        <th className="tx-right"><AccountsNumberFormat amount={total_debit} /></th>
                                        <th className="tx-right"><AccountsNumberFormat amount={total_credit} /></th>
                                        <th className="tx-right" colSpan={2}></th>
                                    </tr>
                                </tbody>
                                }
                            </table>
                        </div>
                    </div>
                </div>
                {/* Content End */}
            </div>

            {/* Form Modal Delete Start*/}
            <div className={`modal fade ${showFormModalDelete ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.delete} {lang.voucher}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalDeleteClose()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tx-center tx-50 tx-warning">
                                        <i className="fal fa-exclamation-circle"></i>
                                    </div>
                                    <h4 className="tx-danger tx-uppercase tx-13 tx-center">Do You Want to Delete?</h4>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top p-2">
                            <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => formSubmitDelete(voucher_id)}><i className="fal fa-check-circle"></i> {lang.yes}</button>
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalDeleteClose()}><i className="fal fa-times-circle"></i> {lang.no}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Form Modal Delete End*/}

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
            <ToastContainer />
        </Layout>
    )
}

export default  VoucherList;
