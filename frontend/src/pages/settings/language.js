import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import Layout from '@/components/layout';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const Language = ()=> {
    let user_id, user_group, user_company, user_branch, user_language;
    if (typeof window !== 'undefined') {
        user_id         = localStorage.getItem('user_id');
        user_group      = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');
        user_branch     = localStorage.getItem('user_branch');
        user_language     = localStorage.getItem('user_language');

        // user_group =1 Super Admin, user_group =2 Admin, user_group =3 Manager, user_group =4 User
        if(user_group == 1 || user_group == 2 || user_group == 3 || user_group == 3 || user_group == 4) { } else {
            router.replace('/logout');
            return true;
        }
    }
    const lang = getTranslation();

    const [warningModal, setWarningModal]           = useState(false);
    const [message, setMassage]                     = useState('');

    const [u_language, setU_language]               = useState(user_language || '');
    const [language_list, setLanguage_list]         = useState([]);

    const language_data = [
        {
            language_code: 'en',
            language_name: 'English'
        },
        {
            language_code: 'bn',
            language_name: 'Bangla'
        },
        {
            language_code: 'es',
            language_name: 'Spanish'
        }
    ]

    const changeLanguage = (lang_code) => {

        const formData = {
            user_id         : user_id,
            user_language   : lang_code
        }
        const axios = apiUrl.put("/settings/change-user-language/"+user_id,formData)
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setTimeout(() => {
                    toast.success(result_data.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                }, 300);
                setU_language(lang_code);
                localStorage.setItem('user_language', lang_code);
                router.reload();
            } else {
                setMassage(result_data.message);
                setWarningModal(true);
            }
        }).catch((e) => {
            console.log(e)
        });
    }

    const systemData = () => {
        const axios = apiUrl.get("/settings/get-user-language/"+user_id);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setU_language(result_data.data.user_language);
            } else {
                setU_language('');
            }
            setLanguage_list(language_data);
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        systemData();
    }, []);

    return (
        <Layout>
            <HeaderTitle title={lang.language} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.language}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/settings">{lang.settings}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.language}</span>
                            </div>
                        </div>
                        {/* <div className="d-flex align-items-center d-print-none">
                            <Link className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.theme} href="/settings/theme"><i className="fal fa-image"></i> {lang.theme} </Link>
                        </div> */}
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <form onSubmit={(e) => formSubmit(e)} >
                        <div className="row justify-content-center">
                            <div className="col-md-6 col-sm-12 mb-3">
                                <div className="row">
                                <div className="table-responsive">
                                    <table className="table table-striped table-bordered">
                                        <thead className="tx-12 tx-uppercase">
                                            <tr>
                                                <th className="tx-center">{lang.sn}</th>
                                                <th className="tx-center">{lang.language_name}</th>
                                                <th className="tx-center">{lang.status}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {language_list.map((row, index) => {
                                            return (
                                            <tr className='' key={index}>
                                                <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                                <td className="tx-left">{row.language_name}</td>
                                                <td className="tx-center">
                                                    {row.language_code==u_language? 'Default':
                                                    <Link className="text-danger mg-r-3 text-decoration-none" href="#" onClick={() => changeLanguage(row.language_code)}>Active</Link>
                                                    }
                                                </td>
                                            </tr>
                                            )})}
                                        </tbody>
                                    </table>
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

export default Language;