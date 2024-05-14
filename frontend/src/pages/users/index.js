import { router } from 'next/router';
import {useState, useEffect, useRef} from 'react';

const Users = ()=> {
    useEffect(() => {
        router.push('users/profile');
    }, []);

    return (
        <></>
    );
}

export default Users;