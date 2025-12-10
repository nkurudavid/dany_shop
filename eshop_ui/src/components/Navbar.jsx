import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

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

        {/* Theme Switch Button */}
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark shadow-soft flex items-center gap-2"
        >
          {t.theme} ({theme === "dark" ? t.lightMode : t.darkMode})
        </button>
      </div>
    </nav>
  );
}
