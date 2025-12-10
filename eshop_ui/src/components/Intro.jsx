import { useLanguage } from "../context/LanguageContext";

function Intro() {
    const { t } = useLanguage();

    return (
        <header className="container py-20 text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">{t.title}</h2>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t.subtitle}
            </p>
        </header>
    );
}

export default Intro;
