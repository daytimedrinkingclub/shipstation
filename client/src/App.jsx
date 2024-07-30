import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import Ship from "./pages/Ship";
import Edit from "./pages/Edit";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ship" element={<Ship />} />
        <Route path="/project/:shipId" element={<Edit />} />
      </Routes>
      <Toaster richColors position="bottom-center" invert />
    </Router>
  );
}

export default App;
