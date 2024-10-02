import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import Ship from "./pages/Ship";
import Edit from "./pages/Edit";
import Landing from "./pages/Landing";
import AppHome from "./pages/AppHome";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<AppHome />} />
            <Route path="/ship" element={<Ship />} />
            <Route path="/project/:shipId" element={<Edit />} />
          </Routes>
          <Toaster richColors position="bottom-center" invert />
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
