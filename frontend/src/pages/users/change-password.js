import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import Layout from '@/components/layout';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const PasswordChange = ()=> {
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
    const [current_password, setCurrent_password]   = useState('');
    const [password, setPassword]                   = useState('');
    const [c_password, setC_password]               = useState('');

    const formSubmit = (e) => {
        e.preventDefault();
        setSubmitButton(true);

        if(password.length !== c_password.length) {
            setMassage(lang.password_not_match);
            setWarningModal(true);
            setSubmitButton(false);
        } else {
            const formData = {
                current_password: current_password,
                password        : password,
                c_password      : c_password
            }
            const axios = apiUrl.put("/users/change-password/"+user_id,formData)
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setTimeout(() => {
                        toast.success(result_data.message, {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1000
                        });
                    }, 2000);
                    setTimeout(() => {
                        router.push('/login');
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
    }

    return (
        <Layout>
            <HeaderTitle title={lang.change_password} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.change_password}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/users">{lang.users}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.change_password}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            <Link className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.my_profile} href="/users/profile"><i className="fal fa-user"></i></Link>
                        </div>
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <form onSubmit={(e) => formSubmit(e)} >
                        <div className="row justify-content-center">
                            <div className="col-md-4 col-sm-12">
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="current_password">{lang.current_password}</label>
                                            <input type="password" className="form-control bd-info" id="current_password" name="current_password" value={current_password} onChange={(e) => setCurrent_password(e.target.value)} required/>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="password">{lang.new_password}</label>
                                            <input type="password" className="form-control bd-info" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="c_password">{lang.c_password}</label>
                                            <input type="password" className="form-control bd-info" id="c_password" name="c_password" value={c_password} onChange={(e) => setC_password(e.target.value)} required/>
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

export default PasswordChange;