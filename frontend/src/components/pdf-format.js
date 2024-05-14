import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import {useState, useEffect, useRef} from 'react';
import { useDownloadExcel } from 'react-export-table-to-excel';
import generatePDF, { Resolution, Margin } from 'react-to-pdf';

const Home = ()=> {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileSidebar, setMobileSidebar]       = useState(false);
    const [showFormModal, setShowFormModal]         = useState(false);

    const [faculty_id, setFaculty_id]               = useState(0);
    const [faculty_code, setFaculty_code]           = useState('');

    const excelExportRef                            = useRef(null);
    const targetRef                                 = useRef();

    const { onDownload } = useDownloadExcel({
        currentTableRef : excelExportRef.current,
        filename        : 'faculty-list',
        sheet           : 'Faculty List'
    });

    const options = {
        filename: "faculty-list.pdf",
        method: 'open',
        method: 'save',
        resolution: Resolution.EXTREME,
        page: {
            // margin is in MM, default is Margin.NONE = 0
            margin: Margin.MEDIUM,
            format: 'A4',
            // format: 'letter',
            orientation: 'portrait',
            // orientation: 'landscape',
        },
        canvas: {
            // mimeType: 'image/png',
            mimeType: 'image/jpeg',
            qualityRatio: 1
        },
        overrides: {
            pdf: {
                compress: true
            },
            canvas: {
                useCORS: true
            }
        },
    };

    const getTargetElement = () => document.getElementById('faculty-list-pdf');


    const formModal = (primary_id) => {
        setFaculty_id(primary_id);
        // if(faculty_id > 0) {
        //     const axios = apiUrl.get("/faculty/get/"+faculty_id)
        //     axios.then((response) => {
        //         const result_data = response.data;
        //         if(result_data.status == 1){
        //             setfaculty_id(result_data.data.faculty_id);
        //             setfaculty_code(result_data.data.faculty_code);
        //             setfaculty_name(result_data.data.faculty_name);
        //             setfaculty_address(result_data.data.faculty_address);
        //             setfaculty_start(result_data.data.faculty_start_date);
        //             setfaculty_picture(result_data.data.faculty_picture);
        //             setfaculty_status(result_data.data.faculty_status);
        //         } else {
        //             setTimeout(() => {
        //                 toast.error(result_data.message, {
        //                     position: toast.POSITION.TOP_RIGHT,
        //                     autoClose: 1000,
        //                 });
        //             }, 300);
        //         }
        //     }).catch((e) => console.log(e));
        // }
        setShowFormModal(true);
    }

    const FormModalClose = () => {
        setShowFormModal(false);
    }

    return (
        <>
            {/* Page Container Start */}
            <div className={`page-container ${isMobileSidebar ? 'page-sidebar-fixed pace-done page-sidebar-visible' : ''}`}>
                {/* Page Sidebar Start */}
                <div className={`d-print-none ${isSidebarCollapsed ? 'page-sidebar-collapsed' : 'page-sidebar'} ${isMobileSidebar ? 'sidebar-scroll' : ''}`}>
                    {/* Logo Start */}
                    <div className="logo">
                        <Link className="logo-img" href="/">
                            <Image className="desktop-logo" src="/assets/images/logo.png" alt="" width={80} height={80} />
                            <Image className="small-logo" src="/assets/images/logo-small.png" alt="" width={80} height={80} />
                        </Link>
                        {isMobileSidebar ?
                        <a id="sidebar-toggle-button-close"  className="text-white tx-right" onClick={() => setMobileSidebar(false)}><i className="fal fa-times wd-20"></i> </a>
                        :
                        <a id="sidebar-toggle-button-close"  className="text-white tx-right" onClick={() => setMobileSidebar(false)}><i className="fal fa-times wd-20"></i> </a>
                        }
                    </div>
                    {/* Logo End */}

                    {/* Page Sidebar Inner Start */}
                    <div className="page-sidebar-inner">

                        {/* Page Sidebar Menu Start */}
                        <div className="page-sidebar-menu">
                            <ul className="accordion-menu">
                                <li className="mg-l-20-force menu-navigation"> Super Admin Module</li>

                                {/* Dashboard Start*/}
                                <li className="animation">
                                    <Link href="/"><i className="fal fa-home mg-r-3"></i> <span>Dashboard</span></Link>
                                </li>
                                {/* Dashboard End*/}

                                {/* Help Desk Start*/}
                                <li>
                                    <Link href="#help-desk" data-bs-toggle="collapse"><i className="fal fa-map-marker-question mg-r-3"></i> <span>Help Desk</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                    <ul className="collapse sub-menu" id="help-desk">
                                        <li className="animation"><Link href="/help-desk/admission-enquiry">Admission Enquiry</Link></li>
                                        <li className="animation"><Link href="/help-desk/admission-enquiry">Admission Enquiry</Link></li>
                                        <li className="animation"><Link href="/help-desk/admission-enquiry">Admission Enquiry</Link></li>
                                        <li className="animation"><Link href="/help-desk/admission-enquiry">Admission Enquiry</Link></li>
                                    </ul>
                                </li>
                                {/* Help Desk End*/}

                                {/* Academics Start*/}
                                <li>
                                    <Link href="#academics" data-bs-toggle="collapse"><i className="fal fa-graduation-cap mg-r-3"></i> <span>Academics</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                    <ul className="collapse sub-menu" id="academics">
                                        <li className="animation"><Link href="/academics/faculty">Faculty</Link></li>
                                        <li className="animation"><Link href="/academics/department">Department</Link></li>
                                        <li className="animation"><Link href="/academics/program">Program</Link></li>
                                        <li className="animation"><Link href="/academics/program_category">Program Category</Link></li>
                                        <li className="animation"><Link href="/academics/batch">Batch</Link></li>
                                        <li className="animation"><Link href="/academics/batch_mapping">Batch Mapping</Link></li>
                                        <li className="animation"><Link href="/academics/session">Session</Link></li>
                                        <li className="animation"><Link href="/academics/semester">Semester</Link></li>
                                        <li className="animation"><Link href="/academics/semester_type">Semester Type</Link></li>
                                        <li className="animation"><Link href="/academics/section">Section</Link></li>
                                        <li className="animation"><Link href="/academics/academics_group">Academics Group</Link></li>
                                        <li className="animation"><Link href="/academics/academics_year">Academics Year</Link></li>
                                        <li className="animation"><Link href="/academics/manage_course">Course</Link></li>
                                        <li className="animation"><Link href="/academics/course_type">Course Type</Link></li>
                                        <li className="animation"><Link href="/academics/course_category">Course Category</Link></li>
                                        <li className="animation"><Link href="/academics/manage_course_offer">Course Offer</Link></li>
                                        <li className="animation"><Link href="/academics/class_time">Class Time</Link></li>
                                        <li className="animation"><Link href="/academics/manage_class_routine">Class Routine</Link></li>
                                        <li className="animation"><Link href="/academics/manage_course_registration">Course Registration</Link></li>
                                        <li className="animation"><Link href="/academics/student_group">Student Group</Link></li>
                                        <li className="animation"><Link href="/academics/faculty">Faculty</Link></li>
                                        <li className="animation"><Link href="/academics/department">Department</Link></li>
                                        <li className="animation"><Link href="/academics/program">Program</Link></li>
                                        <li className="animation"><Link href="/academics/program_category">Program Category</Link></li>
                                        <li className="animation"><Link href="/academics/batch">Batch</Link></li>
                                        <li className="animation"><Link href="/academics/batch_mapping">Batch Mapping</Link></li>
                                        <li className="animation"><Link href="/academics/session">Session</Link></li>
                                        <li className="animation"><Link href="/academics/semester">Semester</Link></li>
                                        <li className="animation"><Link href="/academics/semester_type">Semester Type</Link></li>
                                        <li className="animation"><Link href="/academics/section">Section</Link></li>
                                        <li className="animation"><Link href="/academics/academics_group">Academics Group</Link></li>
                                        <li className="animation"><Link href="/academics/academics_year">Academics Year</Link></li>
                                        <li className="animation"><Link href="/academics/manage_course">Course</Link></li>
                                        <li className="animation"><Link href="/academics/course_type">Course Type</Link></li>
                                        <li className="animation"><Link href="/academics/course_category">Course Category</Link></li>
                                        <li className="animation"><Link href="/academics/manage_course_offer">Course Offer</Link></li>
                                        <li className="animation"><Link href="/academics/class_time">Class Time</Link></li>
                                        <li className="animation"><Link href="/academics/manage_class_routine">Class Routine</Link></li>
                                        <li className="animation"><Link href="/academics/manage_course_registration">Course Registration</Link></li>
                                        <li className="animation"><Link href="/academics/student_group">Student Group</Link></li>
                                    </ul>
                                </li>
                                {/* Academics End*/}

                                {/* Students Start*/}
                                <li>
                                    <Link href="#students" data-bs-toggle="collapse"><i className="fal fa-user-graduate mg-r-3"></i> <span>Students</span> <i className="accordion-icon fa fa-angle-down"></i></Link>
                                    <ul className="collapse sub-menu" id="students">
                                        <li className="animation"><Link href="/students/student-admission">Student Admission</Link></li>
                                        <li className="animation"><Link href="/students/new-admitted-students">New Admitted Students</Link></li>
                                    </ul>
                                </li>
                                {/* Students End*/}

                                {/* Logout Start*/}
                                <li className="animation">
                                    <Link href="/logout"><i className="fal fa-sign-out mg-r-3"></i> <span>Logout</span></Link>
                                </li>
                                {/* Logout End*/}

                            </ul>
                        </div>
                        {/* Page Sidebar Menu End */}

                        {/* Sidebar Footer Start */}
                        <div className="sidebar-footer">
                            <Link className="pull-left" href="/profile" title="Profile">
                                <i className="fal fa-user wd-16"></i>
                            </Link>
                            <Link className="pull-left " href="/notification" title="Notification">
                                <i className="fal fa-envelope"></i>
                            </Link>
                            <Link className="pull-left" href="/password-change" title="Password Change">
                                <i className="fal fa-lock"></i>
                            </Link>
                            <Link className="pull-left" href="/logout" title="Sing Out">
                                <i className="fal fa-sign-out wd-16"></i>
                            </Link>
                        </div>
                        {/* Sidebar Footer End */}
                    </div>
                    {/* Page Sidebar Inner End */}
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
                                        <li className="list-inline-item"><Link className="hidden-md hidden-lg text-white" href="/" onClick={() => setMobileSidebar(false)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        :
                                        <li className="list-inline-item"><Link className="hidden-md hidden-lg text-white" href="/" onClick={() => setMobileSidebar(true)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        }

                                        {/* PC Toggle and Logo */}
                                        {isSidebarCollapsed ?
                                        <li className="list-inline-item"><Link className="hidden-xs hidden-sm text-white" href="/" onClick={() => setSidebarCollapsed(false)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        :
                                        <li className="list-inline-item"><Link className="hidden-xs hidden-sm text-white" href="/" onClick={() => setSidebarCollapsed(true)}><i className="fas fa-bars wd-20"></i></Link></li>
                                        }
                                    </ul>
                                </div>
                            </div>
                            {/* Brand and Logo End */}

                            {/* Header Right Start */}
                            <div className="header-right pull-right">
                                <ul className="list-inline justify-content-end">
                                    {/* Languages Dropdown Start */}
                                    <li className="list-inline-item dropdown hidden-xs">
                                        <Link  href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i className="flag-icon flag-icon-us"></i>
                                        </Link>
                                        <ul className="dropdown-menu languages-dropdown">
                                            <li>
                                                <Link href="#" data-lang="en"><i className="flag-icon flag-icon-us mr-2"></i><span>English-US</span></Link>
                                            </li>
                                            <li>
                                                <Link href="#" data-lang="es"><i className="flag-icon flag-icon-es mr-2"></i><span>Spanish</span></Link>
                                            </li>
                                        </ul>
                                    </li>
                                    {/* Languages Dropdown End */}

                                    {/* Notifications Dropdown Start */}
                                    <li className="list-inline-item dropdown hidden-xs">
                                        <Link className=" notification-icon" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i className="fas fa-bell wd-20"></i>
                                            <span className="notification-count wave in"></span>
                                        </Link>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            {/* Top Notifications Area */}
                                            <div className="top-notifications-area">
                                                {/* Heading */}
                                                <div className="notifications-heading">
                                                    <div className="heading-title">
                                                        <h6>Notifications</h6>
                                                    </div>
                                                    <span>5+ New</span>
                                                </div>
                                                <div className="notifications-box" id="notificationsBox">
                                                    <Link className="dropdown-item list-group-item" href="#">
                                                        <div className="d-flex justify-content-between">
                                                            <div className="wd-35 ht-35 mg-r-10 d-flex align-items-center justify-content-center rounded-circle card-icon-success">
                                                                <i className="fas fa-smile wd-20"></i>
                                                            </div>
                                                        </div>
                                                        <div className="wd-100p">
                                                            <div className="d-flex justify-content-between">
                                                                <h3 className="tx-13 tx-semibold mb-0">Your order is placed</h3>
                                                                <span className="small tx-gray-500 ft-right">Mar 15, 12:32pm</span>
                                                            </div>
                                                            <div className="tx-gray-700">System reboot has been successfully completed</div>
                                                        </div>
                                                    </Link>
                                                    <Link className="dropdown-item list-group-item" href="#">
                                                        <div className="d-flex justify-content-between">
                                                            <div className="wd-35 ht-35 mg-r-10 d-flex align-items-center justify-content-center rounded-circle card-icon-success">
                                                                <i className="fas fa-smile wd-20"></i>
                                                            </div>
                                                        </div>
                                                        <div className="wd-100p">
                                                            <div className="d-flex justify-content-between">
                                                                <h3 className="tx-13 tx-semibold mb-0">Your order is placed</h3>
                                                                <span className="small tx-gray-500 ft-right">Mar 15, 12:32pm</span>
                                                            </div>
                                                            <div className="tx-gray-700">System reboot has been successfully completed</div>
                                                        </div>
                                                    </Link>
                                                    <Link className="dropdown-item list-group-item" href="#">
                                                        <div className="d-flex justify-content-between">
                                                            <div className="wd-35 ht-35 mg-r-10 d-flex align-items-center justify-content-center rounded-circle card-icon-success">
                                                                <i className="fas fa-smile wd-20"></i>
                                                            </div>
                                                        </div>
                                                        <div className="wd-100p">
                                                            <div className="d-flex justify-content-between">
                                                                <h3 className="tx-13 tx-semibold mb-0">Your order is placed</h3>
                                                                <span className="small tx-gray-500 ft-right">Mar 15, 12:32pm</span>
                                                            </div>
                                                            <div className="tx-gray-700">System reboot has been successfully completed</div>
                                                        </div>
                                                    </Link>
                                                </div>
                                                <div className="notifications-footer">
                                                    <Link href="#">View all</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    {/* Notifications Dropdown End */}

                                    {/* Profile Dropdown Start */}
                                    <li className="list-inline-item dropdown">
                                        <Link  href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <Image src="/assets/images/user-icon.png" className="img-fluid wd-30 ht-30 rounded-circle" alt="" width={30} height={30} />
                                        </Link>
                                        <div className="dropdown-menu dropdown-menu-right dropdown-profile">
                                            <div className="user-profile-area">
                                                <div className="user-profile-heading">
                                                    <div className="profile-thumbnail">
                                                        <Image src="/assets/images/user-icon.png" className="img-fluid wd-30 ht-30 rounded-circle" alt="" width={30} height={30} />
                                                    </div>
                                                    <div className="profile-text">
                                                        <h6>Wadudur Rahman</h6>
                                                        <span>IT Officer</span>
                                                    </div>
                                                </div>
                                                <Link className="dropdown-item" href="#"><i className="fas fa-user wd-16 mr-2"></i> My profile</Link>
                                                <Link className="dropdown-item" href="#"><i className="fas fa-sign-out wd-16 mr-2"></i> Sign-out</Link>
                                            </div>
                                        </div>
                                    </li>
                                    {/* Profile Dropdown End */}
                                </ul>
                            </div>
                            {/* Header Right End */}
                        </nav>
                    </div>
                    {/* Page Header End */}

                    {/* Page Inner Start */}
                    <div className="page-inner">
                        <div id="main-wrapper" className="full-page">
                            {/* Breadcrumb Start */}
                            <div className="pageheader pd-t-15 pd-b-15">
                                <div className="d-flex justify-content-between">
                                    <div className="clearfix">
                                        <div className="pd-t-5 pd-b-5">
                                            <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">Faculty List</h2>
                                        </div>
                                        <div className="breadcrumb pd-0 mg-0 d-print-none">
                                            <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> Home</Link>
                                            <Link className="breadcrumb-item" href="/academics">Academics</Link>
                                            <span className="breadcrumb-item hidden-xs active">Faculty List</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center d-print-none">
                                        <button type="button" className="btn btn-success rounded-pill" title="New Faculty" onClick={() => formModal(0)}><i className="fal fa-plus"></i></button>&nbsp;
                                        <button type="button" className="btn btn-primary rounded-pill" title="Print" onClick={() => window.print()}><i className="fal fa-print"></i></button>&nbsp;
                                        <button type="button" className="btn btn-info rounded-pill" title="Excel Export" onClick={onDownload}><i className="fal fa-file-excel"></i></button>&nbsp;
                                        <button type="button" className="btn btn-secondary rounded-pill" title="PDF Export" onClick={() => generatePDF(getTargetElement, options)}><i className="fal fa-file-pdf"></i></button>
                                    </div>
                                </div>
                            </div>
                            {/* Breadcrumb End */}

                            {/* Content Start */}
                            <div className="row" id="faculty-list-pdf">
                                <div className="col-md-12 mg-b-15">
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered" ref={excelExportRef}>
                                            <thead className="tx-12 tx-uppercase">
                                                <tr>
                                                    <th className="tx-center">S.N</th>
                                                    <th className="tx-center">Faculty Code</th>
                                                    <th className="tx-center">Short Name</th>
                                                    <th className="tx-center">Faculty Name</th>
                                                    <th className="tx-center">Status</th>
                                                    <th className="tx-center d-print-none">Option</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="">
                                                    <td className="tx-center">01</td>
                                                    <td className="tx-center">101</td>
                                                    <td className="tx-center">FBS</td>
                                                    <td className="tx-left">Business Status</td>
                                                    <td className="tx-center">Active</td>
                                                    <td className="tx-center d-print-none"></td>
                                                </tr>
                                                <tr className="">
                                                    <td className="tx-center">02</td>
                                                    <td className="tx-center">102</td>
                                                    <td className="tx-center">FSE</td>
                                                    <td className="tx-left">Science & Engineering</td>
                                                    <td className="tx-center">Active</td>
                                                    <td className="tx-center d-print-none"></td>
                                                </tr>
                                                <tr className="">
                                                    <td className="tx-center">03</td>
                                                    <td className="tx-center">103</td>
                                                    <td className="tx-center">FHS</td>
                                                    <td className="tx-left">Humanities & Social Sciences</td>
                                                    <td className="tx-center">Active</td>
                                                    <td className="tx-center d-print-none"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* Content Start */}
                        </div>
                    </div>
                    {/* Page Inner End */}
                </div>
                {/* Page Content End */}
            </div>
            {/* Page Container End */}

            {/* Form Modal */}
            <div className={`modal fade zoomIn ${showFormModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{faculty_id == 0 ? 'New' : 'Update'} Faculty</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalClose()}></button>
                        </div>
                        {/* <form onSubmit={(e) => submitForm(e)} > */}
                        <form>
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="faculty_code">Faculty Code</label>
                                            <input type="text" className="form-control bd-danger" id="faculty_code" name="faculty_code" value={faculty_code} onChange={(e) => setFaculty_code(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="faculty_code">Faculty Code</label>
                                            <input type="text" className="form-control bd-danger" id="faculty_code" name="faculty_code" value={faculty_code} onChange={(e) => setFaculty_code(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="faculty_code">Faculty Code</label>
                                            <input type="text" className="form-control bd-danger" id="faculty_code" name="faculty_code" value={faculty_code} onChange={(e) => setFaculty_code(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="faculty_code">Faculty Code</label>
                                            <input type="text" className="form-control bd-danger" id="faculty_code" name="faculty_code" value={faculty_code} onChange={(e) => setFaculty_code(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top p-2">
                                <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase" onClick={() => FormModalClose()}><i className="fal fa-times-circle"></i> Close</button>
                                <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase"><i className="fal fa-check-circle"></i> Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Script src="/assets/js/bootstrap/bootstrap.bundle.min.js"></Script>
        </>
    )
}

export default  Home;
