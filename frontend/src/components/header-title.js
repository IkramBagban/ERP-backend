import Head from "next/head";

const HeaderTitle = ({ title, keywords, description })=> {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="keywords" content={keywords} />
                <meta name="description" content={description} />
            </Head>
        </>
    );
}

HeaderTitle.defaultProps = {
    title: "Welcome to SS Accounts Manager",
    keywords: "SS Accounts Manager",
    description: "SS Accounts Manager",
}
export default HeaderTitle;