import Footer from "../Footer";
import Header from "../Header";

const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="flex w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto items-center justify-center">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
