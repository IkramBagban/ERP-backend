import {useState, useEffect, useRef} from 'react';
import en from "./en.json";
import bn from "./bn.json";
import es from "./es.json";

export const translations = {
    en,bn,es
};

const getTranslation = ()=> {
    const [language, setLanguage] = useState("en");
    useEffect(() => {
        const savedLanguage = localStorage.getItem("user_language");
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);
    return translations[language];
}

export default  getTranslation;