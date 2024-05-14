import Image from "next/image"
import Link from "next/link";
import getTranslation from "@/languages";
import Head from "next/head";
import HeaderTitle from "@/components/header-title";
import HeaderTop from "@/components/header-top";
import apiUrl from "@/components/api-url";
import { toast, ToastContainer } from 'react-toastify';
import { redirect } from "next/navigation";
import router from "next/router";
import { useState } from "react";

const Forgot = ()=> {
    const lang = getTranslation();
    const [showFormModal, setShowFormModal] = useState(false);
    const [submitButton, setSubmitButton]   = useState(false);
    const [warningModal, setWarningModal]   = useState(false);

    const [message, setMassage]         = useState("");
    const [phone_email, setPhone_email] = useState("");
    const [user_id, setUser_id]         = useState("");
    const [password, setPassword]       = useState('');
    const [c_password, setC_password]   = useState('');
    const verifySubmit = () => {
        setSubmitButton(true);
        const formData = {
            phone_email: phone_email
        }

        const axios = apiUrl.post("/users/reset-password-verify/",formData);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setMassage(result_data.message);
                setShowFormModal(true);
                setSubmitButton(false);
                setUser_id(result_data.data.user_id);
                setPassword('');
                setC_password('');
            } else {
                setMassage(result_data.message);
                setWarningModal(true);
                setSubmitButton(false);
                setPassword('');
                setC_password('');
            }
        }).catch((e) => console.log(e));
    }

    const formSubmit = (e) => {
        setSubmitButton(true);
        e.preventDefault();

        if(password.length !== c_password.length) {
            setMassage(lang.password_not_match);
            setWarningModal(true);
            setSubmitButton(false);
        } else {
            const formData = {
                phone_email : phone_email,
                password    : password,
                c_password  : c_password
            }
            const axios = apiUrl.put("/users/reset-password/"+user_id,formData)
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
        <>
            <HeaderTop />
            <HeaderTitle title={lang.forgot_password} keywords="" description=""/>

            {/* Login Start */}
            <div className="ht-100v d-flex bg-gradient">
                <div className="pd-10 mx-auto text-center align-self-center">
                    <div className="login-wrapper">
                        <div className="loginbox">
                            <div className="login pd-y-25 pd-lg-x-100 pd-sm-x-20 pd-x-20 bd-gray-300">
                                <div className="tx-uppercase">
                                    <Image className="img-fluid wd-80 mg-b-10" src="/assets/images/sam-logo.png" alt="" width={70} height={70} />
                                    <p className="tx-white tx-bold tx-16">{lang.software_name}</p>
                                    <p className="tx-white mg-b-20 tx-13 tx-bold">{lang.forgot_password}</p>

                                    <div className="col-md-12 mb-3">
                                        <div className="form-group tx-left">
                                            <input type="text" className="form-control form-control-lg" id="phone_email" name="phone_email" placeholder="Enter Phone / E-mail" value={phone_email} onChange={(e) => setPhone_email(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn btn-success btn-block tx-uppercase ${submitButton?'disabled': ''}`} onClick={()=> verifySubmit()}>{submitButton?lang.process: lang.verify}</button>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="pd-y-10 tx-center tx-uppercase">or</div>
                                        <div className="tx-13 tx-center tx-uppercase">
                                            {lang.login_to_your_account} <Link href="/login" className="tx-white tx-bold">{lang.click_here}</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Login End */}

            {/* Form Modal Start*/}
            <div className={`modal fade zoomIn ${showFormModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.forgot_password}</h6>
                            <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                        </div>
                        <form onSubmit={(e) => formSubmit(e)} >
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="phone_email">{lang.phone_email}</label>
                                            <input type="text" className="form-control bd-danger" id="phone_email" name="phone_email" value={phone_email} onChange={(e) => setPhone_email(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="password">{lang.c_password}</label>
                                            <input type="password" className="form-control bd-danger" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="c_password">{lang.c_password}</label>
                                            <input type="password" className="form-control bd-danger" id="c_password" name="c_password" value={c_password} onChange={(e) => setC_password(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top p-2">
                                <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => setShowFormModal(false)}><i className="fal fa-times-circle"></i> {lang.close}</button>
                                <button type="submit" className={`btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force" ${submitButton?'disabled': ''}`}><i className="fal fa-check-circle"></i> {submitButton?lang.process: lang.submit}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Form Modal End*/}

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
        </>
    );
}

export default Forgot;