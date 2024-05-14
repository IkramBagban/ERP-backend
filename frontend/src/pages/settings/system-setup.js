import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import Layout from '@/components/layout';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const SystemSetup = ()=> {
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

    const [system_title, setSystem_title]           = useState('');
    const [system_name, setSystem_name]             = useState('');
    const [system_address, setSystem_address]       = useState('');
    const [system_phone, setSystem_phone]           = useState('');
    const [system_email, setSystem_email]           = useState('');
    const [system_website, setSystem_website]       = useState('');
    const [system_picture, setSystem_picture]       = useState('');

    const formSubmit = (e) => {
        e.preventDefault();
        setSubmitButton(true);

        const formData = {
            system_title    : system_title,
            system_name     : system_name,
            system_address  : system_address,
            system_phone    : system_phone,
            system_email    : system_email,
            system_website  : system_website
        }
        const axios = apiUrl.post("/settings/system-setting-create/",formData)
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

    const systemData = () => {
        const axios = apiUrl.get("/settings/system-setting/");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setSystem_title(result_data.data.system_title);
                setSystem_name(result_data.data.system_name);
                setSystem_address(result_data.data.system_address);
                setSystem_phone(result_data.data.system_phone);
                setSystem_email(result_data.data.system_email);
                setSystem_website(result_data.data.system_website);
                setSystem_picture(result_data.data.system_picture);
            } else {
                setSystem_title('');
                setSystem_name('');
                setSystem_address('');
                setSystem_phone('');
                setSystem_email('');
                setSystem_website('');
                setSystem_picture('');
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        systemData();
    }, []);

    return (
        <Layout>
            <HeaderTitle title={lang.system_setup} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.system_setup}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/settings">{lang.settings}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.system_setup}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            <Link className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.system_logo} href="/settings/system-logo"><i className="fal fa-image"></i> {lang.system_logo} </Link>
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
                                            <label className="form-label tx-semibold" htmlFor="system_title">{lang.system_title}</label>
                                            <input type="text" className="form-control bd-danger" id="system_title" name="system_title" value={system_title} onChange={(e) => setSystem_title(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="system_name">{lang.system_name}</label>
                                            <input type="text" className="form-control bd-danger" id="system_name" name="system_name" value={system_name} onChange={(e) => setSystem_name(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="system_phone">{lang.phone}</label>
                                            <input type="text" className="form-control bd-danger" id="system_phone" name="system_phone" value={system_phone} onChange={(e) => setSystem_phone(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="system_email">{lang.email}</label>
                                            <input type="text" className="form-control bd-danger" id="system_email" name="system_email" value={system_email} onChange={(e) => setSystem_email(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="system_address">{lang.address}</label>
                                            <input type="text" className="form-control bd-danger" id="system_address" name="system_address" value={system_address} onChange={(e) => setSystem_address(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label tx-semibold" htmlFor="system_website">{lang.website}</label>
                                            <input type="text" className="form-control bd-danger" id="system_website" name="system_website" value={system_website} onChange={(e) => setSystem_website(e.target.value)} required />
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

export default SystemSetup;