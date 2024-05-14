import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/style.css';
import '@/../public/assets/css/color/blue.css';
import '@/../public/assets/css/fontawesome/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/../public/assets/css/flag/flag-icon.min.css';

const App = ({ Component, pageProps })=> {
    return <Component {...pageProps} />
}

export default App;