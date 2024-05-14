import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import Layout from '@/components/layout';

import { useDownloadExcel } from 'react-export-table-to-excel';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import apiUrlFormData from '@/components/api-url-form-data';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const Company = ()=> {
    let user_id, user_group;
    if (typeof window !== 'undefined') {
        user_id       = localStorage.getItem('user_id');
        user_group    = localStorage.getItem('user_group');

        // user_group =1 Super Admin, user_group =2 Admin
        if(user_group == 1 || user_group == 2  || user_group == 3) { } else {
            router.replace('/logout');
            return true;
        }
    }

    const lang = getTranslation();

    const [user_user_group, setUser_user_group]         = useState('');
    const [isDataNotFound, setIsDataNotFound]           = useState(false);
    const [submitButton, setSubmitButton]               = useState(false);

    const excelExportRef                                = useRef(null);
    const { onDownload } = useDownloadExcel({
        currentTableRef : excelExportRef.current,
        filename        : 'company-list',
        sheet           : 'Company List'
    });

    const [showFormModal, setShowFormModal]             = useState(false);
    const [showFormModalView, setShowFormModalView]     = useState(false);
    const [showFormModalDelete, setShowFormModalDelete] = useState(false);

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

    const [company_list, setCompany_list]               = useState([]);
    const [branch_company_list, setBranch_company_list] = useState([]);
    const [company_package_list, setCompany_package_list]= useState([]);
    const [branch_company_info, setBranch_company_info] = useState('');
    const [company_id, setCompany_id]                   = useState(0);
    const [company_name, setCompany_name]               = useState('');
    const [company_owner_name, setCompany_owner_name]   = useState('');
    const [company_phone, setCompany_phone]             = useState('');
    const [company_email, setCompany_email]             = useState('');
    const [company_website, setCompany_website]         = useState('');
    const [company_address, setCompany_address]         = useState('');
    const [company_opening_date, setCompany_opening_date]= useState('');
    const [company_picture, setCompany_picture]         = useState(null);
    const [company_picture_old, setCompany_picture_old]= useState('');
    const [company_package, setCompany_package]         = useState('');
    const [company_status, setCompany_status]           = useState(1);
    const [username, setUsername]                       = useState('');
    const [password, setPassword]                       = useState('');

    const [status, setStatus]                           = useState('all');
    const [search, setSearch]                           = useState('');

    const formModal = (primary_id) => {
        setCompany_id(primary_id);
        if(primary_id > 0) {
            const axios = apiUrl.get("/company/get-company/"+primary_id)
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setCompany_id(result_data.data.company_id);
                    setCompany_name(result_data.data.company_name);
                    setCompany_owner_name(result_data.data.company_owner_name);
                    setCompany_phone(result_data.data.company_phone);
                    setCompany_email(result_data.data.company_email);
                    setCompany_website(result_data.data.company_website);
                    setCompany_address(result_data.data.company_address);
                    setCompany_opening_date(result_data.data.company_opening_date);
                    setCompany_picture_old(result_data.data.company_picture);
                    setCompany_status(result_data.data.company_status);
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
        setShowFormModal(true);
    }

    const formModalView = (company_id) => {
        const axios = apiUrl.get("/branch/get-branch-company/"+company_id);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setBranch_company_list(result_data.data);
                setBranch_company_info(result_data.company);
            } else {
                setBranch_company_list([]);
                setBranch_company_info(result_data.company);
            }
        }).catch((e) => console.log(e));

        setShowFormModalView(true);
    }

    const formModalDelete = (primary_id) => {
        setCompany_id(primary_id);
        setShowFormModalDelete(true);
    }

    const FormModalClose = () => {
        setCompany_id(0);
        setCompany_name('');
        setCompany_owner_name('');
        setCompany_phone('');
        setCompany_email('');
        setCompany_website('');
        setCompany_address('');
        setCompany_opening_date('');
        setCompany_picture(null);
        setUsername('');
        setPassword('');

        setShowFormModal(false);
    }

    const FormModalViewClose = () => {
        setCompany_id(0);
        setCompany_name('');
        setCompany_owner_name('');
        setCompany_phone('');
        setCompany_email('');
        setCompany_website('');
        setCompany_address('');
        setCompany_opening_date('');
        setCompany_picture(null);
        setUsername('');
        setPassword('');

        setShowFormModalView(false);
    }

    const FormModalDeleteClose = () => {
        setCompany_id(0);

        setShowFormModalDelete(false);
    }

    const formSubmit = (e) => {
        e.preventDefault();
        setSubmitButton(true);
        let axios;
        if(company_id > 0) {
            const formData = new FormData();
            formData.append('company_name', company_name);
            formData.append('company_owner_name', company_owner_name);
            formData.append('company_phone', company_phone);
            formData.append('company_email', company_email);
            formData.append('company_website', company_website);
            formData.append('company_address', company_address);
            formData.append('company_opening_date', company_opening_date);
            formData.append('company_picture', company_picture);
            formData.append('company_package', company_package);
            formData.append('company_status', company_status);
            axios = apiUrlFormData.put("/company/company-update/"+company_id,formData)
        } else {
            const formData = new FormData();
            formData.append('company_name', company_name);
            formData.append('company_owner_name', company_owner_name);
            formData.append('company_phone', company_phone);
            formData.append('company_email', company_email);
            formData.append('company_website', company_website);
            formData.append('company_address', company_address);
            formData.append('company_opening_date', company_opening_date);
            formData.append('company_picture', company_picture);
            formData.append('company_package', company_package);
            formData.append('company_status', company_status);
            formData.append('username', username);
            formData.append('password', password);
            axios = apiUrlFormData.post("/company/company-create/",formData)
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                if(company_id > 0){
                    const updatedArray = company_list.map((data) =>
                    data.company_id === company_id ? result_data.data : data
                    );
                    setCompany_list(updatedArray);
                } else {
                    setCompany_list(current => [result_data.data, ...current]);
                }
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);

                setCompany_id(0);
                setCompany_name('');
                setCompany_owner_name('');
                setCompany_phone('');
                setCompany_email('');
                setCompany_website('');
                setCompany_address('');
                setCompany_opening_date('');
                setCompany_picture(null);
                setCompany_package('');
                setUsername('');
                setPassword('');

                setSubmitButton(false);
                setShowFormModal(false);
            } else {
                setTimeout(() => {
                    toast.error(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                    });
                }, 300);
                setSubmitButton(false);
            }
        }).catch((e) => console.log(e));
    }

    const formSubmitDelete = (delete_id) => {
        const axios = apiUrl.delete("/company/company-delete/"+delete_id,)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const deleteArray = company_list.filter((data) => data.company_id !== delete_id);
                setCompany_list(deleteArray);
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
                setCompany_id(0);
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
        const axios = apiUrl.get("/company/company-list/?status="+status+"&search="+search);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCompany_list(result_data.data);
                setIsDataNotFound(false);
            } else {
                setCompany_list([]);
                setIsDataNotFound(true);
            }
        }).catch((e) => {
            setCompany_list([]);
            setIsDataNotFound(true);
        });
    }

    const companyPackageData = () => {
        const axios = apiUrl.get("/company-package/company-package-list-active/");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCompany_package_list(result_data.data);
            } else {
                setCompany_package_list([]);
            }
        }).catch((e) => {
            setCompany_package_list([]);
        });
    }
    useEffect(() => {
        setUser_user_group(user_group);
        companyData();
        companyPackageData();
    }, [status, search]);

    return (
        <Layout>
            <HeaderTitle title={lang.company} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.company}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.company}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            {user_user_group == 1 || user_user_group == 2 ?
                            <button type="button" className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new_company} onClick={() => formModal(0)}><i className="fal fa-plus"></i></button>
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
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-8 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="search">{lang.search}</label>
                                    <input type="text" className="form-control bd-info" id="search" name="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="col-md-4 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="status">{lang.status}</label>
                                    <select type="text" className="form-control border border-info" id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
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
                                        <th className="tx-center">{lang.picture}</th>
                                        <th className="tx-center">{lang.company_name}</th>
                                        <th className="tx-center">{lang.owner_name}</th>
                                        <th className="tx-center">{lang.phone_number}</th>
                                        <th className="tx-center">{lang.email}</th>
                                        <th className="tx-center">{lang.website}</th>
                                        <th className="tx-center">{lang.address}</th>
                                        <th className="tx-center">{lang.opening_date}</th>
                                        <th className="tx-center">{lang.package}</th>
                                        <th className="tx-center">{lang.status}</th>
                                        <th className="tx-center d-print-none">{lang.option}</th>
                                    </tr>
                                </thead>
                                {company_list.length > 0 ?
                                <tbody>
                                    {company_list.map((row, index) => {
                                    return (
                                    <tr className='' key={row.company_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-center">
                                            <Image src={row.company_picture} alt="Company Picture" width={30} height={20} />
                                        </td>
                                        <td className="tx-left">{row.company_name}</td>
                                        <td className="tx-left">{row.company_owner_name}</td>
                                        <td className="tx-center">{row.company_phone}</td>
                                        <td className="tx-left">{row.company_email}</td>
                                        <td className="tx-left">{row.company_website}</td>
                                        <td className="tx-left">{row.company_address}</td>
                                        <td className="tx-center">{row.company_opening_date}</td>
                                        <td className="tx-center">{row.company_package_name}</td>
                                        <td className="tx-center">{row.company_status==1?lang.active:lang.inactive}</td>
                                        <td className="tx-center d-print-none">
                                            <Link className="text-warning mg-r-3" href="#" title={lang.branch} onClick={() => formModalView(row.company_id)}><i className="fas fa-eye wd-16 mr-2"></i></Link>
                                            {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                            <Link className="text-primary mg-r-3" href="#" title={lang.edit} onClick={() => formModal(row.company_id)}><i className="fas fa-pencil wd-16 mr-2"></i></Link>
                                            :''}
                                            {user_user_group == 1 ?
                                            <Link className="text-danger" href="#" title={lang.remove} onClick={() => formModalDelete(row.company_id)}><i className="fas fa-times wd-16 mr-2"></i></Link>
                                            :''}
                                        </td>
                                    </tr>
                                    )})}
                                </tbody>
                                :
                                (!isDataNotFound) ?
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none" colSpan="11">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                                :
                                <tbody>
                                    <tr>
                                        <th className="tx-center text-danger" colSpan="11">{lang.data_not_found}</th>
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
                            <h6 className="modal-title text-white">{company_id == 0 ? lang.new : lang.update} {lang.company}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalClose()}></button>
                        </div>
                        <form onSubmit={(e) => formSubmit(e)} >
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_name">{lang.company_name}</label>
                                            <input type="text" className="form-control bd-danger" id="company_name" name="company_name" value={company_name} onChange={(e) => setCompany_name(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_owner_name">{lang.owner_name}</label>
                                            <input type="text" className="form-control bd-danger" id="company_owner_name" name="company_owner_name" value={company_owner_name} onChange={(e) => setCompany_owner_name(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                {company_id == 0?
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="username">{lang.username}</label>
                                            <input type="text" className="form-control bd-danger" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="password">{lang.password}</label>
                                            <input type="password" className="form-control bd-danger" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                : ''}

                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_phone">{lang.phone_number}</label>
                                            <input type="tel" className="form-control bd-danger" id="company_phone" name="company_phone" value={company_phone} onChange={(e) => setCompany_phone(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_email">{lang.email}</label>
                                            <input type="email" className="form-control bd-danger" id="company_email" name="company_email" value={company_email} onChange={(e) => setCompany_email(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_website">{lang.website}</label>
                                            <input type="text" className="form-control bd-info" id="company_website" name="company_website" value={company_website} onChange={(e) => setCompany_website(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_address">{lang.address}</label>
                                            <input type="text" className="form-control bd-info" id="company_address" name="company_address" value={company_address} onChange={(e) => setCompany_address(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_opening_date">{lang.opening_date}</label>
                                            <input type="date" className="form-control bd-info" id="company_opening_date" name="company_opening_date" value={company_opening_date} onChange={(e) => setCompany_opening_date(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_picture">{lang.picture}</label>
                                            <input type="file" accept="image/*" className="form-control bd-info" id="company_picture" name="company_picture" onChange={(e) => setCompany_picture(e.target.files[0])} />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className={`${user_user_group ==1 || user_user_group ==2? 'col-md-6': 'col-md-12'} mt-3`}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="company_package">{lang.package}</label>
                                            <select type="text" className="form-control border border-danger" id="company_package" name="company_status" value={company_package} onChange={(e) => setCompany_package(e.target.value)}>
                                                <option value=""> {lang.select} </option>
                                                {company_package_list.map(row => (
                                                <option key={row.company_package_id} value={row.company_package_id}>{row.company_package_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            {user_user_group ==1 || user_user_group ==2?
                                            <>
                                            <label className="form-label" htmlFor="company_status">{lang.status}</label>
                                            <select type="text" className="form-control border border-danger" id="company_status" name="company_status" value={company_status} onChange={(e) => setCompany_status(e.target.value)}>
                                                {status_list.map(status_row => (
                                                <option key={status_row.status_id} value={status_row.status_id}>{status_row.status_name}</option>
                                                ))}
                                            </select>
                                            </>
                                            :
                                            <>
                                            <input type="hidden" className="form-control bd-info" id="company_status" name="company_status" value={company_status} onChange={(e) => setCompany_status(e.target.value)} />
                                            </>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top p-2">
                                <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalClose()}><i className="fal fa-times-circle"></i> {lang.close}</button>
                                <button type="submit" className={`btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force ${submitButton?'disabled': ''}`}><i className="fal fa-check-circle"></i> {submitButton?lang.process: lang.save}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Form Modal End*/}

            {/* Form Modal View Start*/}
            <div className={`modal fade zoomIn ${showFormModalView ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.view} {lang.branch}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalViewClose()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <h4 className="tx-13 tx-uppercase tx-bold mt-3">{lang.company}: {branch_company_info.company_name}</h4>
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="tx-12 tx-uppercase">
                                        <tr>
                                            <th className="tx-center">{lang.sn}</th>
                                            <th className="tx-center">{lang.branch_code}</th>
                                            <th className="tx-center">{lang.branch_name}</th>
                                            <th className="tx-center">{lang.phone_number}</th>
                                            <th className="tx-center">{lang.email}</th>
                                            <th className="tx-center">{lang.address}</th>
                                            <th className="tx-center">{lang.opening_date}</th>
                                        </tr>
                                    </thead>
                                    {branch_company_list.length > 0 ?
                                    <tbody>
                                        {branch_company_list.map((row, index) => {
                                        return (
                                        <tr className='' key={row.branch_id}>
                                            <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                            <td className="tx-center">{row.branch_code}</td>
                                            <td className="tx-left">{row.branch_name}</td>
                                            <td className="tx-center">{row.branch_phone}</td>
                                            <td className="tx-left">{row.branch_email}</td>
                                            <td className="tx-left">{row.branch_address}</td>
                                            <td className="tx-center">{row.branch_opening_date}</td>
                                        </tr>
                                        )})}
                                    </tbody>
                                    :
                                    <tbody>
                                        <tr>
                                            <th className="tx-center text-danger" colSpan="11">{lang.data_not_found}</th>
                                        </tr>
                                    </tbody>
                                    }
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer border-top p-2">
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalViewClose()}><i className="fal fa-times-circle"></i> {lang.close}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Form Modal View End*/}

            {/* Form Modal Delete Start*/}
            <div className={`modal fade ${showFormModalDelete ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.delete} {lang.company}</h6>
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
                            <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => formSubmitDelete(company_id)}><i className="fal fa-check-circle"></i> {lang.yes}</button>
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

export default  Company;
