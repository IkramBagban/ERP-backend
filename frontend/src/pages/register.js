import Image from "next/image"
import Link from "next/link";
import {useState, useEffect, useRef} from 'react';
import getTranslation from "@/languages";
import HeaderTitle from "@/components/header-title";
import HeaderTop from "@/components/header-top";
import apiUrl from "@/components/api-url";
import { toast, ToastContainer } from 'react-toastify';
import router from "next/router";

const Register = ()=> {
    const lang = getTranslation();

    const [warningModal, setWarningModal]               = useState(false);
    const [successModal, setSuccessModal]               = useState(false);
    const [message, setMassage]                         = useState('');
    const [message_2, setMassage_2]                     = useState('');
    const [submitButton, setSubmitButton]               = useState(false);

    const [company_package_list, setCompany_package_list]= useState([]);
    const [company_name, setCompany_name]               = useState("");
    const [company_owner_name, setCompany_owner_name]   = useState("");
    const [company_phone, setCompany_phone]             = useState("");
    const [company_email, setCompany_email]             = useState("");
    const [company_website, setCompany_website]         = useState("");
    const [company_address, setCompany_address]         = useState("");
    const [company_opening_date,setCompany_opening_date]= useState("");
    const [company_package, setCompany_package]          = useState("");
    const [company_picture, setCompany_picture]         = useState(null);
    const [username, setUsername]                       = useState('');
    const [password, setPassword]                       = useState('');

    const submitForm = (e) => {
        setSubmitButton(true);
        e.preventDefault();
        const formData = new FormData();
        formData.append('company_name', company_name);
        formData.append('company_owner_name', company_owner_name);
        formData.append('company_phone', company_phone);
        formData.append('company_email', company_email);
        formData.append('company_website', company_website);
        formData.append('company_address', company_address);
        formData.append('company_opening_date', company_opening_date);
        formData.append('company_package', company_package);
        formData.append('company_picture', company_picture);
        formData.append('username', username);
        formData.append('password', password);

        const axios = apiUrl.post("/company/company-register/",formData);
        axios.then((response) => {
            const response_result = response.data;
            if(response_result.status == 1){
                setSuccessModal(true);
                setMassage(response_result.message);
                setMassage_2('Please Contact with us for Company Activation');
                setWarningModal(false);
                setSubmitButton(false);
            } else {
                setWarningModal(true);
                setMassage(response_result.message);
                setSuccessModal(false);
                setSubmitButton(false);
            }
        }).catch((e) => console.log(e));
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
        companyPackageData();
    }, []);
    return (
        <>
            <HeaderTop />
            <HeaderTitle title={lang.register} keywords="" description=""/>

            {/* Login Start */}
            <div className="ht-100v bg-gradient">
                <div className="container-fluid">
                    <div className="pd-10">
                        <div className="tx-center">
                            <div className="tx-uppercase">
                                <Image className="img-fluid wd-80 mg-b-10" src="/assets/images/sam-logo.png" alt="" priority={true} width={70} height={70} />
                                <p className="tx-white tx-bold tx-16">{lang.software_name}</p>
                                <p className="tx-white mg-b-20 tx-13 tx-bold">{lang.register_as_a_company}</p>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                        <div className="col-md-6 col-sm-12 bg-white">
                            <form onSubmit={(e) => submitForm(e)} autoComplete="off">
                                <div className="p-3 pt-0">
                                    <div className="row">
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_name">{lang.company_name}</label>
                                                <input type="text" className="form-control bd-danger" id="company_name" name="company_name" value={company_name} onChange={(e) => setCompany_name(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_owner_name">{lang.owner_name}</label>
                                                <input type="text" className="form-control bd-danger" id="company_owner_name" name="company_owner_name" value={company_owner_name} onChange={(e) => setCompany_owner_name(e.target.value)} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="username">{lang.username}</label>
                                                <input type="text" className="form-control bd-danger" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="password">{lang.password}</label>
                                                <input type="password" className="form-control bd-danger" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_phone">{lang.phone}</label>
                                                <input type="tel" className="form-control bd-danger" id="company_phone" name="company_phone" value={company_phone} onChange={(e) => setCompany_phone(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_email">{lang.email}</label>
                                                <input type="email" className="form-control bd-danger" id="company_email" name="company_email" value={company_email} onChange={(e) => setCompany_email(e.target.value)} required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_website">{lang.website}</label>
                                                <input type="text" className="form-control bd-info" id="company_website" name="company_website" value={company_website} onChange={(e) => setCompany_website(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_opening_date">{lang.opening_date}</label>
                                                <input type="date" className="form-control bd-info" id="company_opening_date" name="company_opening_date" value={company_opening_date} onChange={(e) => setCompany_opening_date(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_address">{lang.address}</label>
                                                <input type="text" className="form-control bd-info" id="company_address" name="company_website" value={company_address} onChange={(e) => setCompany_address(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-3">
                                            <div className="form-group">
                                                <label className="form-label tx-semibold" htmlFor="company_picture">{lang.company_logo}</label>
                                                <input type="file" accept="image/*" className="form-control bd-info" id="company_picture" name="company_picture" onChange={(e) => setCompany_picture(e.target.files[0])} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mt-3">
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
                                    </div>

                                    <div className="row mt-3">
                                        <div className="col-md-12 mt-3">
                                            <div className="form-group">
                                                <div className="d-grid gap-2">
                                                    <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${submitButton?'disabled': ''}`} >{submitButton?lang.process: lang.register}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 mt-3">
                                            <div className="pd-y-10 tx-center tx-uppercase">or</div>
                                            <div className="tx-13 tx-center tx-uppercase">
                                                {lang.login_to_your_account} <Link href="/login" className="tx-success tx-bold">{lang.click_here}</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Login End */}

            {/* Success Modal Start*/}
            <div className={`modal fade ${successModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-success m-0 p-2">
                            <h6 className="modal-title text-white"> </h6>
                            <button type="button" className="btn-close" onClick={() => router.push('/login')}></button>
                        </div>

                        <div className="modal-body m-0 pl-3 pr-3 pt-0">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="tx-center tx-50 tx-success">
                                        <i className="fal fa-check-circle"></i>
                                    </div>
                                    <h4 className="tx-success tx-uppercase tx-13 tx-bold tx-center">{message}</h4>
                                    <p className="tx-danger tx-uppercase tx-10 tx-center tx-bold">{message_2}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top p-2">
                            <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => router.push('/login')}><i className="fal fa-times-circle"></i> {lang.close}</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Warning Modal End*/}
            {/* Login End */}

            {/* Warning Modal Start*/}
            <div className={`modal fade ${warningModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-md">
                    <div className="modal-content">
                        <div className="modal-header bg-danger m-0 p-2">
                            <h6 className="modal-title text-white"> </h6>
                            <button type="button" className="btn-close" onClick={() => setWarningModal(false)}></button>
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

export default Register;