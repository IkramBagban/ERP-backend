import { router } from 'next/router';
import {useState, useEffect, useRef} from 'react';

const Voucher = ()=> {
    useEffect(() => {
        router.push('voucher/new-voucher');
    }, []);

    return (
        <></>
    );
}

export default Voucher;