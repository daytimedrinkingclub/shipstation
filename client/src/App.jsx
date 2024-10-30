import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import Ship from "./pages/Ship";
import Edit from "./pages/Edit";
import Portfolio from "./pages/Portfolio";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  useEffect(() => {
    // Add 'dark' class to the <html> element
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <Router>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/" element={<Portfolio />} />
                  <Route path="/ship" element={<Ship />} />
                  <Route path="/editor" element={<Edit />} />
                </Routes>
                <Toaster richColors position="bottom-center" invert />
              </Router>
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
