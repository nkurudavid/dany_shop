import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
    const { lang, setLang, t } = useLanguage();
    const { toggleTheme } = useTheme();

    return (
        <nav className="w-full border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-heading font-bold">DanyShop</h1>

            <div className="flex items-center gap-4">
                {/* Language Selector */}
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="border px-2 py-1 rounded dark:bg-secondary dark:border-gray-600"
                >
                    <option value="en">English</option>
                    <option value="rw">Kinyarwanda</option>
                    <option value="fr">French</option>
                    <option value="sw">Swahili</option>
                </select>

                {/* Theme Switch */}
                <button
                    onClick={toggleTheme}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark shadow-soft"
                >
                    {t.theme}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
