import { useLanguage } from "../context/LanguageContext";

export default function AboutUs() {
    const { t } = useLanguage();

    return (
        <section className="py-16 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto px-6 text-center max-w-3xl">
                <h3 className="text-3xl font-bold mb-6">{t.aboutUs}</h3>
                <p className="text-gray-700 dark:text-gray-300">
                    {t.aboutText}
                </p>
            </div>
        </section>
    );
}
