import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import {useState, useEffect, useRef} from 'react';
import Layout from '@/components/layout';

import { useDownloadExcel } from 'react-export-table-to-excel';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import apiUrlFormData from '@/components/api-url-form-data';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const UserList = ()=> {
    let user_group, user_company, user_branch;
    if (typeof window !== 'undefined') {
        user_group      = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');
        user_branch     = localStorage.getItem('user_branch');

        // user_group =1 Super Admin, user_group =2 Admin, user_group =3 Manager, user_group =4 User
        if(user_group == 1 || user_group == 2 || user_group == 3 || user_group == 3) { } else {
            router.replace('/logout');
            return true;
        }
    }

    const lang = getTranslation();

    const [searchButton, setSearchButton]               = useState(false);

    const excelExportRef                                = useRef(null);
    const { onDownload } = useDownloadExcel({
        currentTableRef : excelExportRef.current,
        filename        : 'user-list',
        sheet           : 'User List'
    });

    const [showFormModal, setShowFormModal]             = useState(false);
    const [warningModal, setWarningModal]               = useState(false);
    const [message, setMassage]                         = useState('');
    const [userModal, setUserModal]                     = useState(false);
    const [u_user_group, setU_user_group]               = useState('');
    const [showFormModalDelete, setShowFormModalDelete] = useState(false);

    const [company_list, setCompany_list]               = useState([]);
    const [branch_list, setBranch_list]                 = useState([]);
    const [user_group_list, setUser_group_list]         = useState([]);
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

    const [company, setCompany]                     = useState(user_company || 0);
    const [branch, setBranch]                       = useState(user_branch || '');
    const [status, setStatus]                       = useState('all');

    const [user_list, setUser_list]                 = useState([]);

    const [user_id, setUser_id]                     = useState('');
    const [user_name, setUser_name]                 = useState('');
    const [username, setUsername]                   = useState('');
    const [user_designation, setUser_designation]   = useState('');
    const [password, setPassword]                   = useState('');
    const [user_phone, setUser_phone]               = useState('');
    const [user_email, setUser_email]               = useState('');
    const [user_address, setUser_address]           = useState('');
    const [user_user_group, setUser_user_group]     = useState('');
    const [user_status, setUser_status]             = useState('');

    const formModal = (u_id) => {
        setUser_id(u_id);
        if(u_id > 0) {
            const axios = apiUrl.get("/users/get-user/"+u_id)
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setUser_id(result_data.data.user_id);
                    setUser_name(result_data.data.user_name);
                    setUsername(result_data.data.username);
                    setUser_phone(result_data.data.user_phone);
                    setUser_email(result_data.data.user_email);
                    setUser_address(result_data.data.user_address);
                    setCompany(result_data.data.user_company);
                    setBranch(result_data.data.user_branch);
                    setUser_user_group(result_data.data.user_group);
                    setUser_status(result_data.data.user_status);
                } else {
                    setUser_id('');
                    setUser_name('');
                    setUsername('');
                    setPassword('');
                    setUser_phone('');
                    setUser_email('');
                    setUser_address('');
                    setUser_address('');
                    setUser_user_group('');
                    setUser_status('');
                }
            }).catch((e) => console.log(e));
        }
        setShowFormModal(true);
    }

    const FormModalClose = () => {
        setUser_id('');
        setUser_name('');
        setUsername('');
        setPassword('');
        setUser_phone('');
        setUser_email('');
        setUser_address('');
        setUser_address('');
        setUser_user_group('');
        setUser_status('');

        setShowFormModal(false);
    }

    const formSubmit = (e) => {
        e.preventDefault();

        let axios;
        if(user_id > 0) {
            const formData = {
                user_name   : user_name,
                username    : username,
                user_designation: user_designation,
                user_phone  : user_phone,
                user_email  : user_email,
                user_address: user_address,
                user_address: user_address,
                user_company: company,
                user_branch : branch,
                user_group  : user_user_group,
                user_status : user_status,
            }
            axios = apiUrl.put("/users/user-update/"+user_id,formData)
        } else {
            const formData = {
                user_name   : user_name,
                username    : username,
                password    : password,
                user_designation: user_designation,
                user_phone  : user_phone,
                user_email  : user_email,
                user_address: user_address,
                user_address: user_address,
                user_company: company,
                user_branch : branch,
                user_group  : user_user_group,
                user_status : user_status,
            }
            axios = apiUrl.post("/users/user-create/",formData)
        }
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const axios = apiUrl.get("/users/user-list/?company="+company+"&branch="+branch+"&status="+status);
                axios.then((response) => {
                    const result_data = response.data;
                    if(result_data.status == 1){
                        setUser_list(result_data.data);
                    } else {
                        setUser_list([]);
                    }
                }).catch((e) => console.log(e));

                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
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

    const formModalDelete = (primary_id) => {
        setUser_id(primary_id);
        setShowFormModalDelete(true);
    }

    const FormModalDeleteClose = () => {
        setUser_id('');

        setShowFormModalDelete(false);
    }

    const formSubmitDelete = (delete_id) => {
        const axios = apiUrl.delete("/users/user-delete/"+delete_id,)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const deleteArray = user_list.filter((data) => data.user_id !== delete_id);
                setUser_list(deleteArray);
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
                setUser_id(0);
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

    const userGroupData = () => {
        const axios = apiUrl.get("/users/user-group-list-active");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setUser_group_list(result_data.data);
            } else {
                setUser_group_list([]);
            }
        }).catch((e) => console.log(e));
    }

    const searchUser = ()=> {
        setSearchButton(true);
        const axios = apiUrl.get("/users/user-list/?company="+company+"&branch="+branch+"&status="+status);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setUser_list(result_data.data);
                setSearchButton(false);
            } else {
                setUser_list([]);
                setSearchButton(false);
            }
        }).catch((e) => console.log(e));
    }

    const viewUser = (data) => {
        setUser_id(data);
        const axios = apiUrl.get("users/get-user/"+data);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setUser_data(result_data.data);
            } else {
                setUser_data('');
            }
        }).catch((e) => console.log(e));

        setUserModal(true);
    }

    const userModalClose = ()=> {
        setUserModal(false);
    }

    useEffect(() => {
        setU_user_group(user_group);
        companyData();
        branchData();
        userGroupData();
    }, [company]);

    return (
        <Layout>
            <HeaderTitle title={lang.user_list} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.user_list}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/users">{lang.users}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.user_list}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            {u_user_group == 1 || u_user_group == 2 || u_user_group == 3?
                            <button type="button"className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new_user} onClick={()=> formModal(0)}><i className="fal fa-plus"></i></button>
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
                            <div className="col-md-3 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="company">{lang.company}</label>
                                    <select type="text" className="form-control bd-info" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)}>
                                        {u_user_group == 1 || u_user_group == 2?
                                        <option value="0">System</option>
                                        :''}
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
                                        {u_user_group == 1 || u_user_group == 2 || u_user_group == 3?
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
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="status">{lang.status}</label>
                                    <select type="text" className="form-control border border-info" id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}>
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
                                        <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${searchButton?'disabled': ''}`} onClick={() => searchUser()}>{searchButton?lang.process: lang.search}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered" ref={excelExportRef}>
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center">{lang.sn}</th>
                                        <th className="tx-center">{lang.picture}</th>
                                        <th className="tx-center">{lang.full_name}</th>
                                        <th className="tx-center">{lang.username}</th>
                                        <th className="tx-center">{lang.phone}</th>
                                        <th className="tx-center">{lang.email}</th>
                                        <th className="tx-center">{lang.address}</th>
                                        <th className="tx-center">{lang.group}</th>
                                        <th className="tx-center">{lang.status}</th>
                                        <th className="tx-center d-print-none">{lang.option}</th>
                                    </tr>
                                </thead>
                                {searchButton?
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none" colSpan="11">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                                :
                                <tbody>
                                    {user_list.map((row, index) => {
                                    return (
                                    <tr className='' key={row.user_id}>
                                        <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                        <td className="tx-center">
                                            <Image className="img wd-25 wd-sm-25 ht-25 ht-sm-25 rounded-circle" src={row.user_picture} alt="User Picture" width={30} height={30} />
                                        </td>
                                        <td className="tx-left">{row.user_name}</td>
                                        <td className="tx-center">{row.username}</td>
                                        <td className="tx-center">{row.user_phone}</td>
                                        <td className="tx-left">{row.user_email}</td>
                                        <td className="tx-left">{row.user_address}</td>
                                        <td className="tx-center">{row.user_group_name}</td>
                                        <td className="tx-center">{row.user_status==1?lang.active:lang.inactive}</td>
                                        <td className="tx-center d-print-none">
                                            {/* <Link className="text-warning mg-r-3" href="#" title={lang.branch} onClick={() => viewUser(row.user_id)}><i className="fas fa-eye wd-16 mr-2"></i></Link> */}
                                            {u_user_group == 1 || u_user_group == 2 || u_user_group == 3?
                                            <Link className="text-primary mg-r-3" href="#" title={lang.edit} onClick={() => formModal(row.user_id)}><i className="fas fa-pencil wd-16 mr-2"></i></Link>
                                            : ''}
                                            {u_user_group == 1 ?
                                            <Link className="text-danger" href="#" title={lang.remove} onClick={() => formModalDelete(row.user_id)}><i className="fas fa-times wd-16 mr-2"></i></Link>
                                            :''}
                                        </td>
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
                            <h6 className="modal-title text-white">{user_id == 0 ? lang.new : lang.update} {lang.user}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalClose()}></button>
                        </div>
                        <form onSubmit={(e) => formSubmit(e)} >
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_company">{lang.company}</label>
                                            <select type="text" className="form-control bd-danger" id="user_company" name="user_company" value={company} onChange={(e) => setCompany(e.target.value)} required>
                                                {u_user_group == 1 || u_user_group == 2?
                                                <option value="0">System</option>
                                                :''}
                                                {company_list.map(company_row => (
                                                <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_branch">{lang.branch}</label>
                                            <select type="text" className="form-control bd-danger" id="user_branch" name="user_branch" value={branch} onChange={(e) => setBranch(e.target.value)} required>
                                                {u_user_group == 1 || u_user_group == 2?
                                                <option value="0">No Branch</option>
                                                :<option value="">{lang.select}</option>}
                                                {branch_list.map(branch_row => (
                                                <option key={branch_row.branch_id} value={branch_row.branch_id}>{branch_row.branch_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_name">{lang.full_name}</label>
                                            <input type="text" className="form-control bd-danger" id="user_name" name="user_name" value={user_name} onChange={(e) => setUser_name(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="username">{lang.username}</label>
                                            <input type="text" className="form-control bd-danger" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    {user_id > 0?
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_address">{lang.address}</label>
                                            <input type="hidden" className="form-control bd-danger" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                            <input type="text" className="form-control bd-info" id="user_address" name="user_address" value={user_address} onChange={(e) => setUser_address(e.target.value)} />
                                        </div>
                                    </div>
                                    : <>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_address">{lang.password}</label>
                                            <input type="password" className="form-control bd-danger" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_address">{lang.address}</label>
                                            <input type="text" className="form-control bd-info" id="user_address" name="user_address" value={user_address} onChange={(e) => setUser_address(e.target.value)} />
                                        </div>
                                    </div>
                                    </> }
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_phone">{lang.phone}</label>
                                            <input type="tel" className="form-control bd-danger" id="user_phone" name="user_phone" value={user_phone} onChange={(e) => setUser_phone(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_email">{lang.email}</label>
                                            <input type="email" className="form-control bd-danger" id="user_email" name="user_email" value={user_email} onChange={(e) => setUser_email(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_user_group">{lang.user_group}</label>
                                            <select type="text" className="form-control bd-danger" id="user_user_group" name="user_user_group" value={user_user_group} onChange={(e) => setUser_user_group(e.target.value)} required>
                                                <option value="">{lang.select}</option>
                                                {user_group_list.map(group_row => (
                                                    <option key={group_row.user_group_id} value={group_row.user_group_id}>{group_row.user_group_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_status">{lang.status}</label>
                                            <select type="text" className="form-control bd-danger" id="user_status" name="user_status" value={user_status} onChange={(e) => setUser_status(e.target.value)} required>
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
                            <h6 className="modal-title text-white">{lang.delete} {lang.user}</h6>
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
                            <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => formSubmitDelete(user_id)}><i className="fal fa-check-circle"></i> {lang.yes}</button>
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

            {/* User Modal Start*/}
            {/* <div className={`modal fade zoomIn ${userModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.view} {lang.user}</h6>
                            <button type="button" className="btn-close" onClick={() => userModalClose()}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12 mt-3">
                                    <h5 className="tx-center tx-bold text-decoration-underline tx-uppercase tx-14">{user_data.user_user_type_name}</h5>

                                    <table className="" width="100%" align="center">
                                        <tbody>
                                            <tr className="text-uppercase">
                                                <th className="tx-left" width="50%">{lang.user_no}: {user_data.user_user_number}</th>
                                                <th className="tx-right" width="50%">{lang.date}: {new Date(user_data.user_posting_date).getDate()}-{new Date(user_data.user_posting_date).getMonth()+1}-{new Date(user_data.user_posting_date).getFullYear()}</th>
                                            </tr>
                                        </tbody>
                                    </table><br/>

                                    <table className="" width="100%" align="center">
                                        <tbody>
                                            <tr className="">
                                                <th className="tx-left text-uppercase" width="10%">{lang.narration}: </th>
                                                <th className="tx-left" width="85%">{user_data.user_narration}</th>
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
                                            <th className="text-center">{lang.head_of_user}</th>
                                            <th className="text-center">{lang.particulars}</th>
                                            <th className="text-center">{lang.debit}</th>
                                            <th className="text-center">{lang.credit}</th>
                                        </tr>
                                    </thead>
                                    {user_details.length > 0 ?
                                    <tbody>
                                        {user_details.map((row, index) => {
                                        return (
                                        <tr className='' key={row.user_details_id}>
                                            <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                            <td className="tx-left">{row.user_details_general_ledger_code} - {row.user_details_general_ledger_name}</td>
                                            <td className="tx-left">{row.user_details_subsidiary_ledger_code} - {row.user_details_subsidiary_ledger_name}</td>
                                            <td className="tx-right"><UserNumberFormat amount={row.user_details_debit} /></td>
                                            <td className="tx-right"><UserNumberFormat amount={row.user_details_credit} /></td>
                                        </tr>
                                        )})}
                                        <tr className="table-info text-uppercase">
                                            <th className="tx-right" colSpan={3}>{lang.total_amount}</th>
                                            <th className="tx-right"><UserNumberFormat amount={user_data.user_total_debit} /></th>
                                            <th className="tx-right"><UserNumberFormat amount={user_data.user_total_credit} /></th>
                                        </tr>
                                        <tr className="tx-uppercase">
                                            <th className="tx-left" colSpan={5}>
                                                {lang.in_words}: {numberToWords.toWords(user_data.user_total_debit)} Only.
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
                            <button type="button" className="btn btn-sm btn-info rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => printUser(user_id)}><i className="fal fa-print"></i> {lang.print}</button>
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => userModalClose()}><i className="fal fa-times-circle"></i> {lang.close}</button>
                        </div>
                    </div>
                </div>
            </div> */}
            {/* User Modal End*/}
            <ToastContainer />
        </Layout>
    )
}

export default  UserList;