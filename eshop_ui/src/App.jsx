import Navbar from "./components/Navbar";
import Intro from "./components/Intro";
import FeaturedProducts from "./components/FeaturedProducts";
import Categories from "./components/Categories";
import AboutUs from "./components/AboutUs";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all">
      <Navbar />
      <Intro />
      <FeaturedProducts />
      <Categories />
      <AboutUs />
      <Footer />
    </div>
  );
}

export default App;
