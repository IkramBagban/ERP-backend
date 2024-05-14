import Link from "next/link";
import Image from "next/image";
import getTranslation from "@/languages";
import { useEffect, useState } from "react";

const Header = ()=> {
    let user_id, user_group, user_group_name, user_name, username, user_id_number, user_designation, user_phone, user_email, user_picture, user_company, user_branch, user_language;
    if (typeof window !== 'undefined') {
        user_id             = localStorage.getItem('user_id');
        user_group          = localStorage.getItem('user_group');
        user_group_name     = localStorage.getItem('user_group_name');
        user_name           = localStorage.getItem('user_name');
        username            = localStorage.getItem('username');
        user_id_number      = localStorage.getItem('user_id_number');
        user_designation    = localStorage.getItem('user_designation');
        user_phone          = localStorage.getItem('user_phone');
        user_email          = localStorage.getItem('user_email');
        user_picture        = localStorage.getItem('user_picture');
        user_company        = localStorage.getItem('user_company');
        user_branch         = localStorage.getItem('user_branch');
        user_language       = localStorage.getItem('user_language');
    }
    const lang = getTranslation();
    const [u_language, setU_language]       = useState('');
    const [u_picture, setU_picture]         = useState('');
    const [u_name, setU_name]               = useState('');
    const [u_designation, setU_designation] = useState('');

    useEffect(() => {
        setU_language(user_language);
        setU_picture(user_picture);
        setU_name(user_name);
        setU_designation(user_designation);
    }, []);
    return (
        <>
            {/* Header Right Start */}
            <div className="header-right pull-right">
                <ul className="list-inline justify-content-end">
                    {/* Languages Dropdown Start */}
                    <li className="list-inline-item dropdown">
                        {u_language == 'en'?
                        <i className="flag-icon flag-icon-us"></i>
                        :(u_language == 'bn')?
                        <i className="flag-icon flag-icon-bd"></i>
                        :(u_language == 'es')?
                        <i className="flag-icon flag-icon-es"></i>
                        :''}
                    </li>
                    {/* Languages Dropdown End */}

                    {/* Profile Dropdown Start */}
                    <li className="list-inline-item dropdown">
                        <Link  href="#" role="button" data-bs-toggle="dropdown">
                            <Image className="img-fluid wd-30 ht-30 rounded-circle" src="/assets/images/user-icon.png" alt="Profile Picture" width={30} height={30} loading="lazy" />
                        </Link>
                        <div className="dropdown-menu dropdown-menu-right dropdown-profile">
                            <div className="user-profile-area">
                                <div className="user-profile-heading m-0 p-2">
                                    <div className="profile-thumbnail">
                                        <Image className="img-fluid wd-30 ht-30 rounded-circle" src="/assets/images/user-icon.png" alt="Profile Picture" width={30} height={30} loading="lazy" />
                                    </div>
                                    <div className="profile-text">
                                        <h6>{u_name}</h6>
                                        <span>{u_designation}</span>
                                    </div>
                                </div>
                                <Link className="dropdown-item bd-bottom p-2" href="/users/profile"><i className="fas fa-user wd-16 mr-2"></i> {lang.my_profile}</Link>
                                <Link className="dropdown-item bd-bottom p-2" href="/users/change-password"><i className="fas fa-lock wd-16 mr-2"></i> {lang.change_password}</Link>
                                <Link className="dropdown-item bd-bottom p-2" href="/logout"><i className="fas fa-sign-out wd-16 mr-2"></i> {lang.logout}</Link>
                            </div>
                        </div>
                    </li>
                    {/* Profile Dropdown End */}
                </ul>
            </div>
            {/* Header Right End */}
        </>
    );
}

export default Header;