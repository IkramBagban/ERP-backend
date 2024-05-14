import router from 'next/router'
const Auth = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if(!token) {
            localStorage.removeItem("user_id",);
            localStorage.removeItem("user_id_number");
            localStorage.removeItem("user_name");
            localStorage.removeItem("username");
            localStorage.removeItem("user_designation");
            localStorage.removeItem("user_phone");
            localStorage.removeItem("user_email");
            localStorage.removeItem("user_address");
            localStorage.removeItem("user_picture");
            localStorage.removeItem("user_language");
            localStorage.removeItem("user_theme");
            localStorage.removeItem("user_company");
            localStorage.removeItem("user_branch");
            localStorage.removeItem("user_group");
            localStorage.removeItem("user_group_name");
            localStorage.removeItem("token");
            router.push('/login');
            return true;
        }
    }
}

export default  Auth