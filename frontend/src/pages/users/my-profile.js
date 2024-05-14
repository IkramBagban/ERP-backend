import { router } from 'next/router';
import {useState, useEffect, useRef} from 'react';

const MyProfile = ()=> {
    useEffect(() => {
        router.push('users/profile');
    }, []);

    return (
        <></>
    );
}

export default MyProfile;