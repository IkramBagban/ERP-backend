import { router } from 'next/router';
import {useState, useEffect, useRef} from 'react';

const Settings = ()=> {
    useEffect(() => {
        router.push('settings/language');
    }, []);

    return (
        <></>
    );
}

export default Settings;