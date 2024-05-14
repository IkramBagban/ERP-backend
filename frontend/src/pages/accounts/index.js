import { router } from 'next/router';
import {useState, useEffect, useRef} from 'react';

const Accounts = ()=> {
    useEffect(() => {
        router.push('accounts/chart-of-accounts');
    }, []);

    return (
        <></>
    );
}

export default Accounts;