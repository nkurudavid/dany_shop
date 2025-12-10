import Navbar from "./components/Navbar";
import Intro from "./components/Intro";

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-dark text-secondary dark:text-white transition-all">
      <Navbar />
      <Intro />
    </div>
  );
}

export default App;