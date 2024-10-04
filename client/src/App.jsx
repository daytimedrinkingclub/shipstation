import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import Ship from "./pages/Ship";
import Edit from "./pages/Edit";
import Portfolio from "./pages/Portfolio";
import Showcase from "./pages/Showcase";
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Portfolio />} />
            <Route path="/ship" element={<Ship />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/project/:shipId" element={<Edit />} />
          </Routes>
          <Toaster richColors position="bottom-center" invert />
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
