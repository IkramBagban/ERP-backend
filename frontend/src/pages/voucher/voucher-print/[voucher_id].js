import apiUrl from '@/components/api-url';
import getTranslation from '@/languages';
import React, {useState, useEffect, useRef} from 'react';
import Image from 'next/image';

import router from 'next/router';
import AccountsNumberFormat from '@/components/accounts-number-format';
import numberToWords from 'number-to-words';

const VoucherPrint = ({data})=> {
    let user_id, user_group, user_company, user_branch;
    if (typeof window !== 'undefined') {
        user_id         = localStorage.getItem('user_id');
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

    const [voucher_data, setVoucher_data]                   = useState('');
    const [company_data, setCompany_data]                   = useState('');
    const accounts_details                                  = voucher_data.accounts_details || [];

    const voucherData = ()=> {
        const axios = apiUrl.get("accounts/get-voucher/"+data);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setVoucher_data(result_data.data);
            } else {
                setVoucher_data('');
            }
        }).catch((e) => console.log(e));
    }

    const companyData = ()=> {
        const axios = apiUrl.get("/company/get-company/"+voucher_data.accounts_company);
        axios.then((response) => {
            const result_data = response.data;
            if(result_data.status == 1){
                setCompany_data(result_data.data);
            } else {
                setCompany_data('');
            }
        }).catch((e) => console.log(e));
    }

    useEffect(() => {
        voucherData();
        companyData();
        window.print();
    }, []);

    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12 p-3 tx-center">
                        <Image className="tx-center" src={company_data.company_picture} alt="Company Picture" width={70} height={70} />
                        <h2 className="tx-center tx-uppercase tx-20 tx-bold">{company_data.company_name}</h2>
                        <p className="tx-center tx-12 tx-bold tx-uppercase">{company_data.company_address}</p>

                        <table className="tx-uppercase" width="100%" align="center">
                            <tbody>
                                <tr className="">
                                    <th className="tx-center tx-uppercase text-decoration-underline" colSpan="2" width="100%">{voucher_data.accounts_voucher_type_name}</th>
                                </tr>
                                <tr className="">
                                    <th className="tx-left" width="50%">{lang.voucher_no}: {voucher_data.accounts_voucher_number}</th>
                                    <th className="tx-right" width="50%">{lang.date}: {new Date(voucher_data.accounts_posting_date).getDate()}-{new Date(voucher_data.accounts_posting_date).getMonth()+1}-{new Date(voucher_data.accounts_posting_date).getFullYear()}</th>
                                </tr>
                            </tbody>
                        </table><br/>
                        <table className="tx-uppercase" width="100%" align="center">
                            <tbody>
                                <tr className="">
                                    <th className="tx-left" width="10%">{lang.narration}: </th>
                                    <th className="tx-left" width="85%">{voucher_data.accounts_narration}</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 p-3 pt-0">
                        <table className="table table-bordered">
                            <thead className="tx-12 tx-uppercase">
                                <tr>
                                    <th className="text-center">{lang.sn}</th>
                                    <th className="text-center">{lang.head_of_accounts}</th>
                                    <th className="text-center">{lang.particulars}</th>
                                    <th className="text-center">{lang.debit}</th>
                                    <th className="text-center">{lang.credit}</th>
                                </tr>
                            </thead>
                            {accounts_details.length > 0 ?
                            <tbody>
                                {accounts_details.map((row, index) => {
                                return (
                                <tr className='' key={row.accounts_details_id}>
                                    <td className="tx-center">{(index+1).toString().padStart(2, '0')}</td>
                                    <td className="tx-left">{row.accounts_details_general_ledger_code} - {row.accounts_details_general_ledger_name}</td>
                                    <td className="tx-left">{row.accounts_details_subsidiary_ledger_code} - {row.accounts_details_subsidiary_ledger_name}</td>
                                    <td className="tx-right"><AccountsNumberFormat amount={row.accounts_details_debit} /></td>
                                    <td className="tx-right"><AccountsNumberFormat amount={row.accounts_details_credit} /></td>
                                </tr>
                                )})}
                                <tr className="text-uppercase">
                                    <th className="tx-right" colSpan={3}>{lang.total_amount}</th>
                                    <th className="tx-right"><AccountsNumberFormat amount={voucher_data.accounts_total_debit} /></th>
                                    <th className="tx-right"><AccountsNumberFormat amount={voucher_data.accounts_total_credit} /></th>
                                </tr>
                                <tr className="tx-uppercase">
                                    <th className="tx-left" colSpan={5}>
                                        {lang.in_words}: {numberToWords.toWords(voucher_data.accounts_total_debit)} Only.
                                    </th>
                                </tr>
                            </tbody>
                            :
                            <tbody>
                                <tr>
                                    <th className="tx-center tx-uppercase text-danger" colSpan="5">{lang.data_not_found}</th>
                                </tr>
                            </tbody>
                            }
                        </table>
                        <br/><br/><br/>
                        <table className="" width="100%" align="center">
                            <tbody><tr className="text-uppercase">
                                    <th width="15%" className="text-center bd-top">{lang.prepared_by}</th>
                                    <th width="20%"></th>
                                    <th width="15%" className="text-center bd-top">{lang.checked_by}</th>
                                    <th width="20%"></th>
                                    <th width="15%" className="text-center bd-top">{lang.authorized}</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps = async (context) => {
    const data = context.params.voucher_id;
    // const url = 'http://103.229.47.117:4000';
    // const voucher_data_url = url+"/accounts/get-voucher/"+data;
    // const voucher_res = await fetch(voucher_data_url);
    // const voucherData = await voucher_res.json();
    // const voucher_data = voucherData.data;

    // const company_data_url = url+"/company/get-company/"+voucher_data.accounts_company;
    // const company_res = await fetch(company_data_url);
    // const companyData = await company_res.json();
    // const company_data  = companyData.data;

    return {
        props:{
            // voucher_data, company_data
            data
        }
    }
}

export default VoucherPrint;