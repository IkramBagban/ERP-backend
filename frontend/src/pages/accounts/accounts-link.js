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

const AccountsLink = ()=> {
    let user_id, user_group, user_company;
    if (typeof window !== 'undefined') {
        user_id       = localStorage.getItem('user_id');
        user_group    = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');

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
        filename        : 'accounts-link-list',
        sheet           : 'Accounts Link List'
    });

    const [user_user_group, setUser_user_group]            = useState('');
    const [showFormModal, setShowFormModal]             = useState(false);

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

    const [chart_of_accounts_list, setChart_of_accounts_list]       = useState([]);
    const [company_list, setCompany_list]                           = useState([]);
    const [accounts_link_list, setAccounts_link_list]               = useState([]);
    const [accounts_link_id, setAccounts_link_id]                   = useState(0);
    const [accounts_link_code, setAccounts_link_code]               = useState('');
    const [accounts_link_name, setAccounts_link_name]               = useState('');
    const [accounts_link_accounts, setAccounts_link_accounts]       = useState('');
    const [accounts_link_status, setAccounts_link_status]           = useState(1);

    const [company, setCompany]                         = useState(user_company || '');
    const [status, setStatus]                           = useState('all');
    const [search, setSearch]                           = useState('');

    const formModal = (primary_id) => {
        setAccounts_link_id(primary_id);
        if(primary_id > 0) {
            const axios = apiUrl.get("/accounts-link/get-accounts-link/"+primary_id)
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setAccounts_link_id(result_data.data.accounts_link_id);
                    setAccounts_link_code(result_data.data.accounts_link_code);
                    setAccounts_link_name(result_data.data.accounts_link_name);
                    setAccounts_link_accounts(result_data.data.accounts_link_accounts);
                    setAccounts_link_status(result_data.data.accounts_link_status);
                } else {
                    setAccounts_link_id(0);
                    setAccounts_link_code('');
                    setAccounts_link_name('');
                    setAccounts_link_accounts('');
                    setAccounts_link_status('');
                }
            }).catch((e) => console.log(e));
        }
        setShowFormModal(true);
    }

    const FormModalClose = () => {
        setAccounts_link_id(0);
        setAccounts_link_code('');
        setAccounts_link_name('');
        setAccounts_link_accounts('');
        setAccounts_link_status('');

        setShowFormModal(false);
    }

    const formSubmit = (e) => {
        e.preventDefault();

        const formData = {
            accounts_link_company   : company,
            accounts_link_code      : accounts_link_code,
            accounts_link_name      : accounts_link_name,
            accounts_link_accounts  : accounts_link_accounts,
            accounts_link_status    : accounts_link_status
        }

        let axios;
        if(accounts_link_id > 0) {
            axios = apiUrl.put("/accounts-link/accounts-link-update/"+accounts_link_id,formData)
        } else {
            axios = apiUrl.post("/accounts-link/accounts-link-create/",formData)
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                if(accounts_link_id > 0){
                    const updatedArray = accounts_link_list.map((data) =>
                    data.accounts_link_id === accounts_link_id ? result_data.data : data
                    );
                    setAccounts_link_list(updatedArray);
                } else {
                    setAccounts_link_list(current => [...current, result_data.data]);
                }
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);

                setAccounts_link_id(0);
                setAccounts_link_code('');
                setAccounts_link_name('');
                setAccounts_link_status('');

                setShowFormModal(false);
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

    const coaData = () => {
        const axios = apiUrl.get("chart-of-accounts/chart-of-accounts-list-show/"+company)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setChart_of_accounts_list(result_data.data);
            } else {
                setChart_of_accounts_list([]);
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

    const accountsLinkData = () => {
        setSearchButton(true);
        const axios = apiUrl.get("/accounts-link/accounts-link-list/?company="+company+"&status="+status+"&search="+search);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setAccounts_link_list(result_data.data);
                setSearchButton(false);
            } else {
                setAccounts_link_list([]);
                setSearchButton(false);
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        setUser_user_group(user_group);
        companyData();
        coaData();
        accountsLinkData();
    }, [company, status, search]);

    return (
        <Layout>
            <HeaderTitle title={lang.accounts_link} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.accounts_link}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/accounts">{lang.accounts}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.accounts_link}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            {/* {user_user_group == 1 || user_user_group ==2 ?
                            <button type="button" className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new_accounts_link} onClick={() => formModal(0)}><i className="fal fa-plus"></i></button>
                            :''} */}
                            <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.print} onClick={() => window.print()}><i className="fal fa-print"></i></button>
                            <button type="button" className="btn btn-info rounded-pill pd-t-6-force pd-b-5-force" title={lang.excel_export} onClick={onDownload}><i className="fal fa-file-excel"></i></button>
                        </div>
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <div className="col-md-12 mg-b-15">
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="search">{lang.search}</label>
                                    <input type="text" className="form-control bd-info" id="search" name="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4 mt-3">
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
                            <div className="col-md-4 mt-3">
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
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered" ref={excelExportRef}>
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center">{lang.sn}</th>
                                        <th className="tx-center">{lang.accounts_code}</th>
                                        <th className="tx-center">{lang.accounts_name}</th>
                                        <th className="tx-center">{lang.accounts}</th>
                                        <th className="tx-center">{lang.status}</th>
                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                        <th className="tx-center d-print-none">{lang.option}</th>
                                        :""}
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
                                    {accounts_link_list.map((row, index) => {
                                    return (
                                    <tr className='' key={row.accounts_link_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-left">{row.accounts_link_code}</td>
                                        <td className="tx-left">{row.accounts_link_name}</td>
                                        <td className="tx-left">{row.accounts_link_accounts_code} - {row.accounts_link_accounts_name}</td>
                                        <td className="tx-center">{row.accounts_link_status==1?lang.active:lang.inactive}</td>
                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                        <td className="tx-center d-print-none">
                                            <Link className="text-primary mg-r-3" href="#" title={lang.edit} onClick={() => formModal(row.accounts_link_id)}><i className="fas fa-pencil wd-16 mr-2"></i></Link>
                                            {/* {user_user_group == 1 ?
                                            <Link className="text-danger" href="#" title={lang.remove} onClick={() => formModalDelete(row.accounts_link_id)}><i className="fas fa-times wd-16 mr-2"></i></Link>
                                            :''} */}
                                        </td>
                                        :''}
                                    </tr>
                                    )})}
                                </tbody>
                                }
                            </table>
                        </div>
                    </div>
                </div>
                {/* Content End */}
            </div>

            {/* Form Modal Start*/}
            <div className={`modal fade zoomIn ${showFormModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{accounts_link_id == 0 ? lang.new : lang.update} {lang.accounts_link}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalClose()}></button>
                        </div>
                        <form onSubmit={(e) => formSubmit(e)} >
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="accounts_link_company">{lang.company}</label>
                                            <select type="text" className="form-control bd-danger" id="accounts_link_company" name="accounts_link_company" value={company} onChange={(e) => setCompany(e.target.value)} required>
                                                <option value="">{lang.select}</option>
                                                {company_list.map(company_row => (
                                                <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {user_user_group == 1 || user_user_group ==2 ?
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="accounts_link_code">{lang.accounts_code}</label>
                                            <input type="text" className="form-control bd-danger" id="accounts_link_code" name="accounts_link_code" value={accounts_link_code} onChange={(e) => setAccounts_link_code(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="accounts_link_name">{lang.accounts_name}</label>
                                            <input type="text" className="form-control bd-danger" id="accounts_link_name" name="accounts_link_name" value={accounts_link_name} onChange={(e) => setAccounts_link_name(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="accounts_link_name">{lang.accounts_name}</label>
                                            <input type="hidden" className="form-control bd-danger" id="accounts_link_code" name="accounts_link_code" value={accounts_link_code} onChange={(e) => setAccounts_link_code(e.target.value)} required />
                                            <input type="text" className="form-control bd-danger" id="accounts_link_name" name="accounts_link_name" value={accounts_link_name} onChange={(e) => setAccounts_link_name(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                }

                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="accounts_link_accounts">{lang.accounts}</label>
                                            <select type="text" className="form-control bd-danger" id="accounts_link_accounts" name="accounts_link_accounts" value={accounts_link_accounts} onChange={(e) => setAccounts_link_accounts(e.target.value)} required>
                                                <option value="">{lang.select}</option>
                                                {chart_of_accounts_list.map(row => (
                                                    <option key={row.chart_of_accounts_id} value={row.chart_of_accounts_id}>{row.chart_of_accounts_name} ({row.chart_of_accounts_code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="accounts_link_status">{lang.status}</label>
                                            <select type="text" className="form-control bd-danger" id="accounts_link_status" name="accounts_link_status" value={accounts_link_status} onChange={(e) => setAccounts_link_status(e.target.value)} required>
                                                {status_list.map(status_row => (
                                                <option key={status_row.status_id} value={status_row.status_id}>{status_row.status_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top p-2">
                                <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalClose()}><i className="fal fa-times-circle"></i> {lang.close}</button>
                                <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force"><i className="fal fa-check-circle"></i> {lang.save}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Form Modal End*/}

            <ToastContainer />
        </Layout>
    )
}

export default  AccountsLink;
