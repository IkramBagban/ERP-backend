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

const Login = ()=> {
    const lang = getTranslation();
    const [loginButton, setLoginButton] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const submitForm = (e) => {
        setLoginButton(true);
        e.preventDefault();
        const formData = {
            username: username,
            password: password
        }

        const axios = apiUrl.post("/users/login/",formData);
        axios.then((response) => {
            const response_result = response.data;
            if(response_result.status == 1){
                localStorage.setItem("user_id", response_result.data.user_id);
                localStorage.setItem("user_id_number", response_result.data.user_id_number);
                localStorage.setItem("user_name", response_result.data.user_name);
                localStorage.setItem("username", response_result.data.username);
                localStorage.setItem("user_designation", response_result.data.user_designation);
                localStorage.setItem("user_phone", response_result.data.user_phone);
                localStorage.setItem("user_email", response_result.data.user_email);
                localStorage.setItem("user_address", response_result.data.user_address);
                localStorage.setItem("user_picture", response_result.data.user_picture);
                localStorage.setItem("user_language", response_result.data.user_language);
                localStorage.setItem("user_theme", response_result.data.user_theme);
                localStorage.setItem("user_company", response_result.data.user_company);
                localStorage.setItem("user_branch", response_result.data.user_branch);
                localStorage.setItem("user_group", response_result.data.user_group);
                localStorage.setItem("user_group_name", response_result.data.user_group_name);
                localStorage.setItem("token", response_result.token);
                setTimeout(() => {
                    toast.success(response_result.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000
                    });
                    setTimeout(() => {
                        // router.push('/');
                        window.location.replace('/');
                        // window.location.href="/";
                    }, 1000);
                }, 1000);
            } else {
                setTimeout(() => {
                    toast.error(response_result.message, {
                        position: toast.POSITION.TOP_RIGHT,
                        autoClose: 1000,
                    });
                }, 300);
                setLoginButton(false);
            }
        }).catch((e) => console.log(e));
    }
    return (
        <>
            <HeaderTop />
            <HeaderTitle title={lang.login} keywords="" description=""/>

            {/* Login Start */}
            <div className="ht-100v d-flex bg-gradient">
                <div className="pd-10 mx-auto text-center align-self-center">
                    <div className="login-wrapper">
                        <div className="loginbox">
                            <div className="login pd-y-25 pd-lg-x-100 pd-sm-x-20 pd-x-20 align-self-center bd-gray-300">
                                <div className="tx-uppercase">
                                    <Image className="img-fluid wd-80 mg-b-10" src="/assets/images/sam-logo.png" priority={true} alt="" width={70} height={70} />
                                    <p className="tx-white tx-bold tx-16">{lang.software_name}</p>
                                    <p className="tx-white mg-b-20 tx-13 tx-bold">{lang.login_to_your_account}</p>

                                    <form onSubmit={(e) => submitForm(e)} autoComplete="off">
                                        <div className="col-md-12 mb-3">
                                            <div className="form-group tx-left">
                                                <label className="tx-white tx-bold mg-b-5" htmlFor="username">{lang.username}</label>
                                                <input type="text" className="form-control form-control-lg" id="username" name="username" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                            </div>
                                        </div>

                                        <div className="col-md-12 mb-3">
                                            <div className="form-group tx-left">
                                                <label className="tx-white tx-bold mg-b-5" htmlFor="password">{lang.password}</label>
                                                <input type="password" className="form-control form-control-lg" id="password" name="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2">
                                            <button type="submit" className={`btn btn-success btn-block tx-uppercase ${loginButton?'disabled': ''}`}>{loginButton?lang.process: lang.login}</button>
                                        </div>
                                    </form>

                                    <div className="tx-13 tx-center mt-3">
                                        {lang.forgot_password}? <Link href="/forgot" className="tx-semibold">{lang.click_here}</Link>
                                    </div>

                                    <div className="pd-y-10 tx-uppercase">or</div>
                                    <div className="tx-13 tx-center">
                                        {lang.do_not_have_an_account}? <Link href="/register" className="tx-semibold">{lang.register}</Link>
                                    </div>

                                    <div className="tx-13 tx-center">
                                        <p className="pd-y-10 mb-0 tx-center">
                                            Copyright &copy; {new Date().getFullYear()} | All Rights Reserved
                                            <br/> <Link className="text-decoration-none" href="http://accounts.ssitvillage.com" target="_blank"> {lang.software_name}</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Login End */}
            <ToastContainer />
        </>
    );
}

export default Login;