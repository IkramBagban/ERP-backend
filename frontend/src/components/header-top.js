import Head from 'next/head'
import HeaderTitle from './header-title';
import Link from 'next/link';

function HeaderTop() {
    return (
        <>
            <HeaderTitle/>
            <Head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="author" content="" />
                <link rel="shortcut icon" type="image/png" href="/assets/images/sam-logo.png" />
            </Head>
        </>
    );
}

export default HeaderTop;