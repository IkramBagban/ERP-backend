import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import Layout from '@/components/layout';

import { useDownloadExcel } from 'react-export-table-to-excel';

import HeaderTitle from '@/components/header-title';
import getTranslation from '@/languages';
import apiUrl from '@/components/api-url';
import { toast, ToastContainer } from 'react-toastify';
import router from 'next/router';

const FinancialYear = ()=> {
    let user_id, user_group, user_company;
    if (typeof window !== 'undefined') {
        user_id       = localStorage.getItem('user_id');
        user_group    = localStorage.getItem('user_group');
        user_company    = localStorage.getItem('user_company');

        // user_group =1 Super Admin, user_group =2 Admin, user_group =3 Manager, user_group =4 User
        if(user_group == 1 || user_group == 2 || user_group == 3 || user_group == 3 || user_group == 4) { } else {
            router.replace('/logout');
            return true;
        }
    }

    const lang = getTranslation();

    const [searchButton, setSearchButton]               = useState(false);
    const [warningModal, setWarningModal]               = useState(false);
    const [message, setMassage]                         = useState('');

    const excelExportRef                                = useRef(null);
    const { onDownload } = useDownloadExcel({
        currentTableRef : excelExportRef.current,
        filename        : 'financial-year',
        sheet           : 'Financial Year'
    });

    const [user_user_group, setUser_user_group]         = useState('');
    const [showFormModal, setShowFormModal]             = useState(false);

    const month_list = [
        {
            month_id    : '01',
            month_name  : 'January'
        },
        {
            month_id    : '02',
            month_name  : 'February'
        },
        {
            month_id    : '03',
            month_name  : 'March'
        },
        {
            month_id    : '04',
            month_name  : 'April'
        },
        {
            month_id    : '05',
            month_name  : 'May'
        },
        {
            month_id    : '06',
            month_name  : 'June'
        },
        {
            month_id    : '07',
            month_name  : 'July'
        },
        {
            month_id    : '08',
            month_name  : 'August'
        },
        {
            month_id    : '09',
            month_name  : 'September'
        },
        {
            month_id    : '10',
            month_name  : 'October'
        },
        {
            month_id    : '11',
            month_name  : 'November'
        },
        {
            month_id    : '12',
            month_name  : 'December'
        }
    ]

    const [company, setCompany]                         = useState(user_company || '');
    const [company_list, setCompany_list] = useState([]);

    const [financial_year, setFinancial_year]               = useState('');

    const [starting_month, setStarting_month]               = useState('');
    const [closing_month, setClosing_month]                 = useState('');


    const starting_month_data = month_list.find((data) =>
        data.month_id === financial_year.financial_year_starting_month ? data.month_id : ''
    );

    const closing_month_data = month_list.find((data) =>
        data.month_id === financial_year.financial_year_closing_month ? data.month_id : ''
    );

    const starting_month_name = (!starting_month_data)? '' : starting_month_data.month_name;
    const closing_month_name = (!closing_month_data)? '' : closing_month_data.month_name;

    const formModal = (primary_id) => {
        if(company <= 0) {
            setMassage(lang.company_select_warning);
            setWarningModal(true);
            setSearchButton(false);
        } else {
            if(primary_id > 0) {
                const axios = apiUrl.get("/financial-year/get-financial-year/"+company)
                axios.then((response) => {
                    const result_data = response.data;
                    if(result_data.status == 1){
                        setStarting_month(result_data.data.financial_year_starting_month);
                        setClosing_month(result_data.data.financial_year_closing_month);
                    } else {
                        setStarting_month('');
                        setClosing_month('');
                    }
                }).catch((e) => console.log(e));
            }
            setShowFormModal(true);
        }
    }

    const FormModalClose = () => {
        setStarting_month('');
        setClosing_month('');

        setShowFormModal(false);
    }

    const formSubmit = (e) => {
        e.preventDefault();
        if(company <= 0) {
            setMassage(lang.company_select_warning);
            setWarningModal(true);
            setSubmitButton(false);
        } else {
            const formData = {
                financial_year_company          : company,
                financial_year_starting_month   : starting_month,
                financial_year_closing_month    : closing_month
            }

            const axios = apiUrl.post("/financial-year/financial-year-create/",formData)
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    const axios = apiUrl.get("/financial-year/get-financial-year/"+company)
                    axios.then((response) => {
                        const result_data = response.data;
                        if(result_data.status == 1){
                            setStarting_month(result_data.data.financial_year_starting_month);
                            setClosing_month(result_data.data.financial_year_closing_month);
                        } else {
                            setStarting_month('');
                            setClosing_month('');
                        }
                    }).catch((e) => console.log(e));

                    setTimeout(() => {
                        toast.success(result_data.message, {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1000
                        });
                    }, 300);

                    setShowFormModal(false);
                } else {
                    setTimeout(() => {
                        toast.error(result_data.message, {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1000,
                        });
                    }, 300);
                }
            }).catch((e) => console.log(e));
        }
    }

    const searchData = () => {
        setSearchButton(true);
        if(company <= 0) {
            setMassage(lang.company_select_warning);
            setWarningModal(true);
            setSearchButton(false);
            setFinancial_year('');
        } else {
            const axios = apiUrl.get("/financial-year/financial-year-list/?company="+company);
            axios.then((response) => {
                const result_data = response.data;
                if(result_data.status == 1){
                    setFinancial_year(result_data.data);
                    setSearchButton(false);
                } else {
                    setFinancial_year('');
                    setSearchButton(false);
                }
            }).catch((e) => console.log(e));
        }
    }

    const companyData = () => {
        const axios = apiUrl.get("/company/company-list-active");
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCompany_list(result_data.data);
            } else {
                setCompany_list([]);
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        setUser_user_group(user_group);
        companyData();
    }, []);

    return (
        <Layout>
            <HeaderTitle title={lang.financial_year} keywords='' description=''/>
            <div id="main-wrapper" className="full-page">
                {/* Breadcrumb Start */}
                <div className="pageheader pd-t-15 pd-b-10">
                    <div className="d-flex justify-content-between">
                        <div className="clearfix">
                            <div className="pd-t-5 pd-b-5">
                                <h2 className="pd-0 mg-0 tx-14 tx-dark tx-bold tx-uppercase">{lang.financial_year}</h2>
                            </div>
                            <div className="breadcrumb pd-0 mg-0 d-print-none">
                                <Link className="breadcrumb-item" href="/"><i className="fal fa-home"></i> {lang.home}</Link>
                                <Link className="breadcrumb-item" href="/accounts">{lang.accounts}</Link>
                                <span className="breadcrumb-item hidden-xs active">{lang.financial_year}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center d-print-none">
                            {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                            <button type="button" className="btn btn-success rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.new_financial_year} onClick={() => formModal(0)}><i className="fal fa-plus"></i></button>
                            :''}
                            <button type="button" className="btn btn-primary rounded-pill pd-t-6-force pd-b-5-force mg-r-3" title={lang.print} onClick={() => window.print()}><i className="fal fa-print"></i></button>
                            <button type="button" className="btn btn-info rounded-pill pd-t-6-force pd-b-5-force" title={lang.excel_export} onClick={onDownload}><i className="fal fa-file-excel"></i></button>
                        </div>
                    </div>
                </div>
                {/* Breadcrumb End */}

                {/* Content Start */}
                <div className="row">
                    <div className="col-md-12 mg-b-15">
                        <div className="row clearfix mb-3 d-print-none">
                            <div className="col-md-6 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="company">{lang.company}</label>
                                    <select type="text" className="form-control bd-info" id="company" name="company" value={company} onChange={(e) => setCompany(e.target.value)}>
                                        <option value="">{lang.select}</option>
                                        {company_list.map(company_row => (
                                        <option key={company_row.company_id} value={company_row.company_id}>{company_row.company_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6 mt-3">
                                <div className="form-group">
                                    <label className="form-label tx-uppercase tx-semibold" htmlFor="search">&nbsp;</label>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className={`btn btn-success pd-t-6-force pd-b-5-force mg-r-3 tx-uppercase ${searchButton?'disabled': ''}`} onClick={() => searchData()}>{searchButton?lang.process: lang.search}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered" ref={excelExportRef}>
                                <thead className="tx-12 tx-uppercase">
                                    <tr>
                                        <th className="tx-center">{lang.starting_month}</th>
                                        <th className="tx-center">{lang.closing_month}</th>
                                        <th className="tx-center">{lang.status}</th>
                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                        <th className="tx-center d-print-none">{lang.option}</th>
                                        : ''}
                                    </tr>
                                </thead>
                                {searchButton?
                                <tbody>
                                    <tr className=''>
                                        <th className="tx-center d-print-none" colSpan="9">
                                            <Image src="/assets/images/loading/loader.gif" alt="Loading" width={40} height={40} />
                                        </th>
                                    </tr>
                                </tbody>
                                :(financial_year) ?
                                <tbody>
                                    <tr className="">
                                        <td className="tx-center">{financial_year.financial_year_starting_date} {starting_month_name}</td>
                                        <td className="tx-center">{financial_year.financial_year_closing_date} {closing_month_name}</td>
                                        <td className="tx-center">{financial_year.financial_year_status==1?lang.active:lang.inactive}</td>
                                        {user_user_group == 1 || user_user_group == 2 || user_user_group == 3?
                                        <td className="tx-center d-print-none">
                                            <Link className="text-primary mg-r-3" href="#" title={lang.edit} onClick={()=> formModal(company)}><i className="fas fa-pencil wd-16 mr-2"></i></Link>
                                        </td>
                                        : ''}
                                    </tr>
                                </tbody>
                                : ''}
                            </table>
                        </div>
                    </div>
                </div>
                {/* Content End */}
            </div>

            {/* Form Modal Start*/}
            <div className={`modal fade zoomIn ${showFormModal ? 'show d-block' : ''}`} >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary m-0 p-2">
                            <h6 className="modal-title text-white">{lang.financial_year}</h6>
                            <button type="button" className="btn-close" onClick={() => FormModalClose()}></button>
                        </div>
                        <form onSubmit={(e) => formSubmit(e)} >
                            <div className="modal-body m-0 pl-3 pr-3 pt-0">
                                <div className="row">
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="starting_month">{lang.starting_month}</label>
                                            <select type="text" className="form-control bd-danger" id="starting_month" name="starting_month" value={starting_month} onChange={(e) => setStarting_month(e.target.value)}>
                                                <option value="">{lang.select}</option>
                                                {month_list.map(month_row => (
                                                <option key={month_row.month_id} value={month_row.month_id}>{month_row.month_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mt-3">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="closing_month">{lang.closing_month}</label>
                                            <select type="text" className="form-control bd-danger" id="closing_month" name="closing_month" value={closing_month} onChange={(e) => setClosing_month(e.target.value)}>
                                                <option value="">{lang.select}</option>
                                                {month_list.map(month_row => (
                                                <option key={month_row.month_id} value={month_row.month_id}>{month_row.month_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top p-2">
                                <button type="button" className="btn btn-sm btn-danger rounded-pill text-uppercase pd-t-6-force pd-b-5-force" onClick={() => FormModalClose()}><i className="fal fa-times-circle"></i> {lang.close}</button>
                                <button type="submit" className="btn btn-sm btn-success rounded-pill text-uppercase pd-t-6-force pd-b-5-force"><i className="fal fa-check-circle"></i> {lang.save}</button>
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
        </Layout>
    )
}

export default  FinancialYear;
