import Head from 'next/head';
import {useState, useEffect} from 'react';
import router from 'next/router'
import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';

const Logout = () => {
    const lang = getTranslation();
    // let user_id;
    // if (typeof window !== 'undefined') {
    //     user_id = localStorage.getItem("user_id");
    // }

    if (typeof window !== 'undefined') {
        localStorage.getItem("user_id");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_id_number");
        localStorage.removeItem("user_name");
        localStorage.removeItem("username");
        localStorage.removeItem("user_designation");
        localStorage.removeItem("user_phone");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_address");
        localStorage.removeItem("user_picture");
        localStorage.removeItem("user_language");
        localStorage.removeItem("user_theme");
        localStorage.removeItem("user_company");
        localStorage.removeItem("user_branch");
        localStorage.removeItem("user_group");
        localStorage.removeItem("user_group_name");
        localStorage.removeItem("token");
        router.push('/login');
    }
    // const logoutData = ()=> {
    //     const axios = apiUrl.get("/users/logout/"+user_id);
    //     axios.then((response) => {
    //         const result_data = response.data;
    //         if(result_data.status == 1){

    //         } else {

    //         }
    //         console.log('result_data', result_data)
    //     }).catch((e) => console.log(e));
    // }

    // useEffect(() => {
    //     logoutData();
    // }, []);

    return (
        <>
            <HeaderTitle title={lang.logout} keywords="" description=""/>
            <Head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="author" content="" />
                <link rel="shortcut icon" type="image/png" href="/assets/images/sam-logo.png" />
            </Head>
        </>
    )
}

export default  Logout