import { router } from 'next/router';
import {useState, useEffect, useRef} from 'react';

const AccountsReport = ()=> {
    useEffect(() => {
        router.push('accounts-report/ledger-report');
    }, []);

    return (
        <></>
    );
}

export default AccountsReport;