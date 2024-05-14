import getTranslation from '@/languages';
import Image from 'next/image';
const CompanyInfo = ({ company_data, branch_data})=> {

    const lang = getTranslation();
    return (
        <>
            <div className="bd-bottom-dashed">
                <table className="mb-2" width="100%" align="center">
                    <tbody>
                        <tr>
                            <th className="tx-left" width="10%" valign="top">
                                <Image className="tx-center" src={company_data.company_picture} alt="Company Picture" width={70} height={70} />
                            </th>
                            <th className="tx-left" width="50%" valign="top">
                                <h2 className="tx-uppercase tx-18 tx-bold">{company_data.company_name}</h2>
                                {branch_data.branch_name}<br/>
                                {branch_data.branch_address || company_data.company_address}
                            </th>
                            <th className="tx-center" width="5%"></th>

                            <th className="tx-right" width="35%" valign="top">
                            {lang.phone}: {branch_data.branch_phone || company_data.company_phone}<br/>
                            {lang.email}: {branch_data.branch_email || company_data.company_email}<br/>
                            {lang.website}: {company_data.company_website}
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}
export default CompanyInfo;