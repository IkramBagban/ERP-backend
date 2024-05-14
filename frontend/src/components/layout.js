import Link from "next/link";
import Image from "next/image";
import HeaderTop from "./header-top";
import Header from "./header";
import Footer from "./footer";
import Sidebar from "./sidebar";
import Auth from "./auth";
import router from 'next/router';
import getTranslation from "@/languages";
import {useState, useEffect, useRef} from 'react';
const Layout = ({children})=> {
    let user_group, user_company, user_branch;
    if (typeof window !== 'undefined') {
        user_group      = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');
        user_branch     = localStorage.getItem('user_branch');
    }
    const lang = getTranslation();

    const [user_user_group, setUser_user_group]         = useState('');
    const [user_group_name, setUser_group_name]         = useState('');

    const [isSidebarCollapsed, setSidebarCollapsed]     = useState(false);
    const [isMobileSidebar, setMobileSidebar]           = useState(false);

    useEffect(() => {
        setUser_user_group(user_group);
        if(user_group == 1) {
            setUser_group_name(lang.s_admin);
        } else if(user_group == 2) {
            setUser_group_name(lang.admin);
        } else if(user_group == 3) {
            setUser_group_name(lang.company);
        } else {
            setUser_group_name(lang.accounts);
        }
    }, []);
    return (
        <>
            <HeaderTop/>
            <Auth/>
            {/* Page Container Start */}
            <div className={`page-container ${isMobileSidebar ? 'page-sidebar-fixed pace-done page-sidebar-visible' : ''}`}>
                {/* Page Sidebar Start */}
                <div className={`d-print-none ${isSidebarCollapsed ? 'page-sidebar-collapsed' : 'page-sidebar'} ${isMobileSidebar ? 'sidebar-scroll' : ''}`}>
                    {/* Logo Start */}
                    <div className="logo">
                        <Link className="logo-img" href="/">
                            <Image className="desktop-logo" src="/assets/images/sam-logo-color.png" priority={true} alt="" width={178} height={40} />
                            <Image className="small-logo" src="/assets/images/sam-logo.png" priority={true} alt="" width={80} height={80} />
                        </Link>
                        {isMobileSidebar ?
                        <Link id="sidebar-toggle-button-close"  className="text-white tx-right" href="#" onClick={() => setMobileSidebar(false)}><i className="fal fa-times wd-20"></i> </Link>
                        :
                        <Link id="sidebar-toggle-button-close"  className="text-white tx-right" href="#" onClick={() => setMobileSidebar(false)}><i className="fal fa-times wd-20"></i> </Link>
                        }
                    </div>
                    {/* Logo End */}

                    <Sidebar user_group_name={user_group_name} user_group={user_user_group} />
                </div>
                {/* Page Sidebar End */}

                {/* Page Content Start */}
                <div className="page-content">
                    {/* Page Header Start */}
                    <div className="page-header d-print-none">
                        <nav className="navbar navbar-default">
                            {/* Brand and Logo Start */}
                            <div className="navbar-header">
                                <div className="navbar-brand">
                                    <ul className="list-inline">

                                        {/* Mobile Toggle and Logo */}
                                        {isMobileSidebar ?
                                        <li className="list-inline-item"><Link className="hidden-md hidden-lg text-white" href="#" onClick={() => setMobileSidebar(false)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        :
                                        <li className="list-inline-item"><Link className="hidden-md hidden-lg text-white" href="#" onClick={() => setMobileSidebar(true)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        }

                                        {/* PC Toggle and Logo */}
                                        {isSidebarCollapsed ?
                                        <li className="list-inline-item"><Link className="hidden-xs hidden-sm text-white" href="#" onClick={() => setSidebarCollapsed(false)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        :
                                        <li className="list-inline-item"><Link className="hidden-xs hidden-sm text-white" href="#" onClick={() => setSidebarCollapsed(true)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        }
                                    </ul>
                                </div>
                            </div>
                            {/* Brand and Logo End */}
                            <Header />
                        </nav>
                    </div>
                    {/* Page Header End */}

                    {/* Page Inner Start */}
                    <div className="page-inner">
                        {children}
                    </div>
                    {/* Page Inner End */}
                </div>
                {/* Page Content End */}
            </div>
            {/* Page Container End */}
            <Footer />
        </>
    );
}

export default Layout;