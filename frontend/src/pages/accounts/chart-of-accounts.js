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

const Chart_of_accounts = ()=> {
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

    const [user_user_group, setUser_user_group]         = useState('');
    const [isLoading, setIsLoading]                     = useState(false);

    const excelExportRef                                = useRef(null);
    const { onDownload } = useDownloadExcel({
        currentTableRef : excelExportRef.current,
        filename        : 'coa-list',
        sheet           : 'COA List'
    });

    const [showFormModal, setShowFormModal]             = useState(false);
    const [showFormModalDelete, setShowFormModalDelete] = useState(false);
    const [company_list, setCompany_list]               = useState([]);
    const [accounts_category_list, setAccounts_category_list]= useState([]);
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

    const [chart_of_accounts_list, setChart_of_accounts_list]               = useState([]);
    const [chart_of_accounts_id, setChart_of_accounts_id]                   = useState(0);
    const [chart_of_accounts_company, setChart_of_accounts_company]         = useState(user_company || '');
    const [chart_of_accounts_code, setChart_of_accounts_code]               = useState('');
    const [chart_of_accounts_name, setChart_of_accounts_name]               = useState('');
    const [chart_of_accounts_accounts_category, setChart_of_accounts_accounts_category] = useState('');
    const [chart_of_accounts_coa_status, setChart_of_accounts_coa_status]   = useState('');
    const [chart_of_accounts_status, setChart_of_accounts_status]           = useState(1);
    const [company, setCompany]                         = useState(user_company || '');
    const [status, setStatus]                           = useState('all');
    const [search, setSearch]                           = useState('');

    const formModal = (primary_id, category_id, coa_status) => {
        setChart_of_accounts_id(primary_id);
        setChart_of_accounts_accounts_category(category_id);
        setChart_of_accounts_coa_status(coa_status);
        const cat_axios = apiUrl.get("/chart-of-accounts/get-chart-of-accounts-type/"+category_id)
        cat_axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setAccounts_category_list(result_data.data);
            } else {
                setAccounts_category_list([]);
                setChart_of_accounts_accounts_category('');
            }
        }).catch((e) => console.log(e));

        if(primary_id > 0) {
            const axios = apiUrl.get("/chart-of-accounts/get-chart-of-accounts/"+primary_id)
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setChart_of_accounts_id(result_data.data.chart_of_accounts_id);
                    setChart_of_accounts_company(result_data.data.chart_of_accounts_company);
                    setChart_of_accounts_code(result_data.data.chart_of_accounts_code);
                    setChart_of_accounts_name(result_data.data.chart_of_accounts_name);
                    setChart_of_accounts_accounts_category(result_data.data.chart_of_accounts_accounts_category);
                    setChart_of_accounts_coa_status(coa_status);
                    setChart_of_accounts_status(result_data.data.chart_of_accounts_status);
                } else {
                    setChart_of_accounts_id(0);
                    setChart_of_accounts_company('');
                    setChart_of_accounts_code('');
                    setChart_of_accounts_name('');
                    setChart_of_accounts_accounts_category('');
                    setChart_of_accounts_coa_status('');
                    setChart_of_accounts_status('');
                    setTimeout(() => {
                        toast.error(result_data.message, {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1000,
                        });
                    }, 300);
                }
            }).catch((e) => console.log(e));
        }
        setShowFormModal(true);
    }

    const formModalDelete = (primary_id) => {
        setChart_of_accounts_id(primary_id);
        setShowFormModalDelete(true);
    }

    const FormModalClose = () => {
        setChart_of_accounts_id(0);
        setChart_of_accounts_company('');
        setChart_of_accounts_code('');
        setChart_of_accounts_name('');
        setChart_of_accounts_accounts_category('');
        setChart_of_accounts_coa_status('');
        setChart_of_accounts_status('');

        setShowFormModal(false);
    }

    const FormModalDeleteClose = () => {
        setChart_of_accounts_id(0);

        setShowFormModalDelete(false);
    }

    const formSubmit = (e) => {
        e.preventDefault();

        const formData = {
            chart_of_accounts_company: chart_of_accounts_company,
            chart_of_accounts_code: chart_of_accounts_code,
            chart_of_accounts_name: chart_of_accounts_name,
            chart_of_accounts_accounts_category: chart_of_accounts_accounts_category,
            chart_of_accounts_coa_status: chart_of_accounts_coa_status,
            chart_of_accounts_status: chart_of_accounts_status
        }

        let axios;
        if(chart_of_accounts_id > 0) {
            axios = apiUrl.put("/chart-of-accounts/chart-of-accounts-update/"+chart_of_accounts_id,formData)
        } else {
            axios = apiUrl.post("/chart-of-accounts/chart-of-accounts-create/",formData)
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);

                setCompany(chart_of_accounts_company);
                const check_axios = apiUrl.get("/chart-of-accounts/chart-of-accounts-list/?company="+company+"&status="+status+"&search="+search);
                check_axios.then((response) => {
                    const result_data = response.data;
                    if(result_data.status == 1){
                        setChart_of_accounts_list(result_data.data);
                    } else {
                        setChart_of_accounts_list([]);
                    }
                }).catch((e) => console.log(e));

                setChart_of_accounts_id(0);
                setChart_of_accounts_code('');
                setChart_of_accounts_name('');
                setChart_of_accounts_accounts_category('');
                setChart_of_accounts_coa_status('');
                setChart_of_accounts_status('');

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

    const formSubmitDelete = (delete_id) => {
        const axios = apiUrl.delete("/chart-of-accounts/chart-of-accounts-delete/"+delete_id,)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const deleteArray = chart_of_accounts_list.filter((data) => data.chart_of_accounts_id !== delete_id);
                setChart_of_accounts_list(deleteArray);
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
                setChart_of_accounts_id(0);
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

    const chart_of_accountsData = () => {
        setIsLoading(true);
        const axios = apiUrl.get("/chart-of-accounts/chart-of-accounts-list/?company="+company+"&status="+status+"&search="+search);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setChart_of_accounts_list(result_data.data);
                setIsLoading(false);
            } else {
                setChart_of_accounts_list([]);
                setIsLoading(false);
            }
        }).catch((e) => {
            setChart_of_accounts_list([]);
            setIsLoading(false);
        });
    }

    useEffect(() => {
        setUser_user_group(user_group);
        companyData();
        setTimeout(() => {
            chart_of_accountsData();
        }, 500)
    }, [company, status, search]);

    return (
        <Layout>
            <HeaderTitle title={lang.chart_of_accounts} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.chart_of_accounts}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/accounts">{lang.accounts}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.chart_of_accounts}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
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
                            <table className="table table-striped table-bordered table-hover" ref={excelExportRef}>
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center" width="10%">{lang.sn}</th>
                                        <th className="tx-center" width="15%">{lang.accounts_code}</th>
                                        <th className="tx-center" width="45%">{lang.accounts_head}</th>
                                        <th className="tx-center" width="10%">{lang.status}</th>
                                        <th className="tx-center d-print-none" width="20%">{lang.option}</th>
                                    </tr>
                                </thead>
                                {!isLoading?
                                <>
                                {company > 0 ?
                                <tbody>
                                    {(() => {
                                    let serial = 0;
                                    {
                                        return(<>
                                            {chart_of_accounts_list.map((at_row)=> {
                                            return (
                                            <>
                                                <tr className="" key={at_row.chart_of_accounts_id}>
                                                    <th className="tx-center">{(++serial).toString().padStart(2, '0')}</th>
                                                    <th className="tx-left text-uppercase">{at_row.chart_of_accounts_code}</th>
                                                    <th className="tx-left text-uppercase">{at_row.chart_of_accounts_name}</th>
                                                    <th className="tx-center">{at_row.chart_of_accounts_status==1?lang.active:lang.inactive}</th>
                                                    <th className="tx-center d-print-none">

                                                    </th>
                                                </tr>
                                                {at_row.accounts_category.length > 0?
                                                <>
                                                {at_row.accounts_category.map((ac_row) => (
                                                <>
                                                    <tr className="" key={ac_row.chart_of_accounts_id}>
                                                        <th className="tx-center">{(++serial).toString().padStart(2, '0')}</th>
                                                        <th className="tx-left"> &nbsp; &nbsp; {ac_row.chart_of_accounts_code}</th>
                                                        <th className="tx-left">&nbsp; &nbsp; {ac_row.chart_of_accounts_name}</th>
                                                        <th className="tx-center">{ac_row.chart_of_accounts_status==1?lang.active:lang.inactive}</th>
                                                        <th className="tx-center d-print-none">
                                                            {/* {user_user_group == 1 || user_user_group == 2 || user_user_group == 3 || user_user_group == 4?
                                                            <button type="button" className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new+' '+lang.control_group} onClick={() => formModal(0, ac_row.chart_of_accounts_id, 'control_group')}><i className="fal fa-plus"></i></button>
                                                            :''} */}
                                                            {/* {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                                            <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.edit} onClick={() => formModal(ac_row.chart_of_accounts_id, ac_row.chart_of_accounts_accounts_category, 'accounts_category')}><i className="fas fa-pencil wd-16 mr-2"></i></button>
                                                            :''} */}
                                                            {/* {user_user_group == 1 ?
                                                            <button type="button" className="btn btn-danger rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.remove} onClick={() => formModalDelete(ac_row.chart_of_accounts_id)}><i className="fas fa-times wd-16 mr-2"></i></button>
                                                            :''} */}
                                                        </th>
                                                    </tr>
                                                        {ac_row.control_group.map((cg_row) => (
                                                        <>
                                                        <tr className="" key={cg_row.chart_of_accounts_id}>
                                                            <th className="tx-center">{(++serial).toString().padStart(2, '0')}</th>
                                                            <th className="tx-center">{cg_row.chart_of_accounts_code}</th>
                                                            <th className="tx-left">&nbsp; &nbsp; &nbsp; &nbsp; {cg_row.chart_of_accounts_name}</th>
                                                            <th className="tx-center">{cg_row.chart_of_accounts_status==1?lang.active:lang.inactive}</th>
                                                            <th className="tx-center d-print-none">
                                                                {user_user_group == 1 || user_user_group == 2 || user_user_group == 3 || user_user_group == 4?
                                                                <button type="button" className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new+' '+lang.general_ledger} onClick={() => formModal(0, cg_row.chart_of_accounts_id, 'general_ledger')}><i className="fal fa-plus"></i></button>
                                                                :''}
                                                                {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                                                <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.edit} onClick={() => formModal(cg_row.chart_of_accounts_id, cg_row.chart_of_accounts_accounts_category, 'control_group')}><i className="fas fa-pencil wd-16 mr-2"></i></button>
                                                                :''}
                                                                {user_user_group == 1 ?
                                                                <button type="button" className="btn btn-danger rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.remove} onClick={() => formModalDelete(cg_row.chart_of_accounts_id)}><i className="fas fa-times wd-16 mr-2"></i></button>
                                                                :''}
                                                            </th>
                                                        </tr>
                                                            {cg_row.general_ledger.map((gl_row) => (
                                                            <>
                                                            <tr className="" key={gl_row.chart_of_accounts_id}>
                                                                <th className="tx-center">{(++serial).toString().padStart(2, '0')}</th>
                                                                <th className="tx-center"> &nbsp; &nbsp; &nbsp; &nbsp; {gl_row.chart_of_accounts_code}</th>
                                                                <th className="tx-left">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {gl_row.chart_of_accounts_name}</th>
                                                                <th className="tx-center">{gl_row.chart_of_accounts_status==1?lang.active:lang.inactive}</th>
                                                                <th className="tx-center d-print-none">
                                                                    {user_user_group == 1 || user_user_group == 2 || user_user_group == 3 || user_user_group == 4?
                                                                    <button type="button" className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new+' '+lang.subsidiary_ledger} onClick={() => formModal(0, gl_row.chart_of_accounts_id, 'subsidiary_ledger')}><i className="fal fa-plus"></i></button>
                                                                    :''}
                                                                    {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                                                    <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.edit} onClick={() => formModal(gl_row.chart_of_accounts_id, gl_row.chart_of_accounts_accounts_category, 'general_ledger')}><i className="fas fa-pencil wd-16 mr-2"></i></button>
                                                                    :''}
                                                                    {user_user_group == 1 ?
                                                                    <button type="button" className="btn btn-danger rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.remove} onClick={() => formModalDelete(gl_row.chart_of_accounts_id)}><i className="fas fa-times wd-16 mr-2"></i></button>
                                                                    :''}
                                                                </th>
                                                            </tr>
                                                                {gl_row.subsidiary_ledger.map((sl_row) => (
                                                                <tr className="" key={sl_row.chart_of_accounts_id}>
                                                                    <td className="tx-center">{(++serial).toString().padStart(2, '0')}</td>
                                                                    <td className="tx-right">{sl_row.chart_of_accounts_code}</td>
                                                                    <td className="tx-left">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {sl_row.chart_of_accounts_name}</td>
                                                                    <td className="tx-center">{sl_row.chart_of_accounts_status==1?lang.active:lang.inactive}</td>
                                                                    <td className="tx-center d-print-none">
                                                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                                                        <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.edit} onClick={() => formModal(sl_row.chart_of_accounts_id, sl_row.chart_of_accounts_accounts_category, 'subsidiary_ledger')}><i className="fas fa-pencil wd-16 mr-2"></i></button>
                                                                        :''}
                                                                        {user_user_group == 1 ?
                                                                        <button type="button" className="btn btn-danger rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.remove} onClick={() => formModalDelete(sl_row.chart_of_accounts_id)}><i className="fas fa-times wd-16 mr-2"></i></button>
                                                                        :''}
                                                                    </td>
                                                                </tr>
                                                                ))}
                                                            </>
                                                            ))}
                                                        </>
                                                    ))}
                                                </>
                                                ))}
                                                </>
                                                :''}
                                            </>
                                            )})}
                                        </>)
                                    }}) ()}
                                </tbody>
                                : ''}
                                </>:
                                <tbody>
                                    <tr className="">
                                        <th className="tx-center d-print-none" colSpan="5">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
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
                            <h6 className="modal-title text-white">{chart_of_accounts_id == 0 ? lang.new : lang.update} {lang.chart_of_accounts}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalClose()}></button>
                        </div>
                        <form onSubmit={(e) => formSubmit(e)} >
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="chart_of_accounts_company">{lang.company}</label>
                                            <select type="text" className="form-control border border-danger" id="chart_of_accounts_company" name="chart_of_accounts_company" value={chart_of_accounts_company} onChange={(e) => setChart_of_accounts_company(e.target.value)} required>
                                                <option value="">{lang.select}</option>
                                                {company_list.map(company_row => (
                                                <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="chart_of_accounts_accounts_category">{lang.accounts_category}</label>
                                            <select type="text" className="form-control border border-danger" id="chart_of_accounts_accounts_category" name="chart_of_accounts_accounts_category" value={chart_of_accounts_accounts_category} onChange={(e) => setChart_of_accounts_accounts_category(e.target.value)} required>
                                                <option value="">{lang.select}</option>
                                                {accounts_category_list.map(category_row => (
                                                <option key={category_row.chart_of_accounts_id} value={category_row.chart_of_accounts_id}>{category_row.chart_of_accounts_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="chart_of_accounts_code">{lang.accounts_code}</label>
                                            <input type="text" className="form-control bd-danger" id="chart_of_accounts_code" name="chart_of_accounts_code" value={chart_of_accounts_code} onChange={(e) => setChart_of_accounts_code(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="chart_of_accounts_name">{lang.accounts_name}</label>
                                            <input type="text" className="form-control bd-danger" id="chart_of_accounts_name" name="chart_of_accounts_name" value={chart_of_accounts_name} onChange={(e) => setChart_of_accounts_name(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="chart_of_accounts_status">{lang.status}</label>
                                            <select type="text" className="form-control border border-danger" id="chart_of_accounts_status" name="chart_of_accounts_status" value={chart_of_accounts_status} onChange={(e) => setChart_of_accounts_status(e.target.value)}>
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

            {/* Form Modal Delete Start*/}
            <div className={`modal fade ${showFormModalDelete ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.delete} {lang.chart_of_accounts}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalDeleteClose()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tx-center tx-50 tx-warning">
                                        <i className="fal fa-exclamation-circle"></i>
                                    </div>
                                    <h4 className="tx-danger tx-uppercase tx-13 tx-center">{lang.delete_warning}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top p-2">
                            <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => formSubmitDelete(chart_of_accounts_id)}><i className="fal fa-check-circle"></i> {lang.yes}</button>
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalDeleteClose()}><i className="fal fa-times-circle"></i> {lang.no}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Form Modal Delete End*/}
            <ToastContainer />
        </Layout>
    )
}

export default  Chart_of_accounts;
