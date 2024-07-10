import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const RecentlyShipped = () => {
  const { recentlyShipped } = useContext(AuthContext);

  if (!recentlyShipped || recentlyShipped.length === 0) {
    return null;
  }

  return (
    <div className="text-white py-8">
      <div className="w-full max-w-3xl mx-auto px-4 md:px-8 mb-8">
        <hr className="border-t-2 border-dashed border-gray-700" />
      </div>
      <section className="w-full mx-auto px-4 md:px-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Shipped by you:</h2>
        <div
          className="flex flex-wrap justify-center gap-4"
          id="recently-shipped-list"
        >
          {recentlyShipped.map((ship, index) => (
            <a
              key={index}
              href={`${import.meta.env.VITE_BACKEND_URL}/site/${ship.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cerulean hover:text-berkeley-blue border border-cerulean rounded-lg px-4 py-2 transition duration-300 ease-in-out transform hover:scale-105"
            >
              {ship.slug}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecentlyShipped;
