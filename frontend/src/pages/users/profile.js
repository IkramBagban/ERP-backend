import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import Layout from '@/components/layout';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const Profile = ()=> {
    let user_id, user_group, user_company, user_branch;
    if (typeof window !== 'undefined') {
        user_id      = localStorage.getItem('user_id');
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

    const [submitButton, setSubmitButton]           = useState(false);
    const [warningModal, setWarningModal]           = useState(false);
    const [message, setMassage]                     = useState('');

    const [user_id_number, setUser_id_number]       = useState('');
    const [user_name, setUser_name]                 = useState('');
    const [username, setUsername]                   = useState('');
    const [user_designation, setUser_designation]   = useState('');
    const [user_phone, setUser_phone]               = useState('');
    const [user_email, setUser_email]               = useState('');
    const [user_address, setUser_address]           = useState('');

    const formSubmit = (e) => {
        e.preventDefault();
        setSubmitButton(true);

        const formData = {
            user_name       : user_name,
            user_designation: user_designation,
            user_phone      : user_phone,
            user_email      : user_email,
            user_address    : user_address
        }
        const axios = apiUrl.put("/users/profile-update/"+user_id,formData)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
                setSubmitButton(false);
            } else {
                setMassage(result_data.message);
                setWarningModal(true);
                setSubmitButton(false);
            }
        }).catch((e) => {
            setSubmitButton(false);
            console.log(e)
        });
    }

    const profileData = () => {
        const axios = apiUrl.get("/users/get-user/"+user_id);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setUser_id_number(result_data.data.user_id_number);
                setUser_name(result_data.data.user_name);
                setUsername(result_data.data.username);
                setUser_designation(result_data.data.user_designation);
                setUser_phone(result_data.data.user_phone);
                setUser_email(result_data.data.user_email);
                setUser_address(result_data.data.user_address);

                localStorage.setItem("user_id_number", result_data.data.user_id_number);
                localStorage.setItem("user_name", result_data.data.user_name);
                localStorage.setItem("username", result_data.data.username);
                localStorage.setItem("user_designation", result_data.data.user_designation);
                localStorage.setItem("user_phone", result_data.data.user_phone);
                localStorage.setItem("user_email", result_data.data.user_email);
                localStorage.setItem("user_address", result_data.data.user_address);
            } else {
                setUser_id_number('');
                setUser_name('');
                setUsername('');
                setUser_designation('');
                setUser_phone('');
                setUser_email('');
                setUser_address('');
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        profileData();
    }, []);

    return (
        <Layout>
            <HeaderTitle title={lang.my_profile} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.my_profile}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/users">{lang.users}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.my_profile}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            <Link className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.profile_picture} href="/users/profile-picture"><i className="fal fa-image"></i> {lang.profile_picture}</Link>
                        </div>
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <form onSubmit={(e) => formSubmit(e)} >
                        <div className="row justify-content-center">
                            <div className="col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="user_id_number">{lang.id_number}</label>
                                            <input type="text" className="form-control bd-danger" id="user_id_number" name="user_id_number" value={user_id_number} onChange={(e) => setUser_id_number(e.target.value)} readOnly required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="user_name">{lang.full_name}</label>
                                            <input type="text" className="form-control bd-danger" id="user_name" name="user_name" value={user_name} onChange={(e) => setUser_name(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="username">{lang.username}</label>
                                            <input type="text" className="form-control bd-danger" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} readOnly required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="user_designation">{lang.designation}</label>
                                            <input type="text" className="form-control bd-danger" id="user_designation" name="user_designation" value={user_designation} onChange={(e) => setUser_designation(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="user_phone">{lang.phone}</label>
                                            <input type="text" className="form-control bd-danger" id="user_phone" name="user_phone" value={user_phone} onChange={(e) => setUser_phone(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="user_email">{lang.email}</label>
                                            <input type="text" className="form-control bd-danger" id="user_email" name="user_email" value={user_email} onChange={(e) => setUser_email(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="user_address">{lang.address}</label>
                                            <input type="text" className="form-control bd-info" id="user_address" name="user_address" value={user_address} onChange={(e) => setUser_address(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <div className="d-grid gap-2">
                                                <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${submitButton?'disabled': ''}`} >{submitButton?lang.process: lang.save}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
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
    );
}

export default Profile;