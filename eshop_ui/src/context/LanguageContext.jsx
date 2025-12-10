import { createContext, useContext, useState } from "react";
import translations from "../translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState("en");

    return (
        <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
