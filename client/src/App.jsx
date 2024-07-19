import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/toaster";
import Ship from "./pages/ship";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-primary">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ship" element={<Ship />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
