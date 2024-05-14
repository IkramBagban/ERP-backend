import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import apiUrlFormData from '@/components/api-url-form-data';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const ProfilePicture = ()=> {
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

    const [user_picture, setUser_picture]           = useState(null);
    const [user_picture_old, setUser_picture_old]   = useState('');

    const formSubmit = (e) => {
        e.preventDefault();
        setSubmitButton(true);
        const formData = new FormData();
        formData.append('user_picture', user_picture);
        const axios = apiUrlFormData.put("/users/change-profile-picture/"+user_id,formData)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                const axios = apiUrl.get("/users/get-user/"+user_id);
                axios.then((response) => {
                    const user_data = response.data;
                    if(user_data.status == 1){
                        setUser_picture_old(user_data.data.user_picture);
                        localStorage.setItem('user_picture', user_data.data.user_picture);
                        setTimeout(() => {
                            toast.success(result_data.message, {
                                position: toast.POSITION.TOP_RIGHT,
                                autoClose: 1000
                            });
                        }, 300);
                        setUser_picture(null);
                    } else {
                        setUser_picture_old('');
                    }
                }).catch((e) => console.log(e));
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
                setUser_picture_old(result_data.data.user_picture);
            } else {
                setUser_picture_old('');
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        profileData();
    }, []);

    return (
        <Layout>
            <HeaderTitle title={lang.profile_picture} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.profile_picture}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/users">{lang.users}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.profile_picture}</span>
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
                            <div className="col-md-4 col-sm-12 mb-3">
                                <div className="row mb-3">
                                    <div className="col-md-12 mt-3">
                                    {user_picture_old?<Image className="rounded mx-auto d-block" src={user_picture_old} alt="Profile Picture" width={300} height={300} />:''}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12 mt-3">
                                        <div className="form-group">
                                            <input type="file" accept="image/*" className="form-control bd-info" id="user_picture" name="user_picture" onChange={(e) => setUser_picture(e.target.files[0])} required />
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

export default ProfilePicture;