import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Separator } from "@/components/ui/separator"
import { Code, Trophy } from "lucide-react";

const RecentlyShipped = () => {
  const { recentlyShipped } = useContext(AuthContext);
  return (
    <div className="text-white w-full  py-8">
      <section className=" mx-auto px-4 md:px-8">
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">
              <Code className="inline-block w-5 h-5 mr-2" />
              my projects
            </h2>
            <div className="flex flex-wrap gap-4 mb-8">
              {recentlyShipped.length > 0 ? (
                recentlyShipped.map((ship, index) => (
                  <a
                    key={index}
                    href={`${import.meta.env.VITE_BACKEND_URL}/site/${ship.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cerulean hover:text-berkeley-blue border border-cerulean rounded-lg px-4 py-2 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    {ship.slug}
                  </a>
                ))
              ) : (
                <p className="text-gray-400 italic">No projects created yet. Start building something amazing!</p>
              )}
            </div>
          </div>
          <div className="max-w-[300px]">
            <h2 className="text-2xl font-bold mb-6">
              <Trophy className="inline-block w-5 h-5 mr-2 stroke-yellow-500" />
              featured websites
            </h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://shipstation.ai/site/n-times-y-the-curiosity-app-vhzphn8pn/"
                target="_blank"
                className="px-4 py-2 hover:underline"
              >
                N times Y - The Curiosity App
              </a>
              <a
                href="https://shipstation.ai/site/hooksumo-pu6hbyt5d/"
                target="_blank"
                className="px-4 py-2 hover:underline"
              >
                HookSumo - Zapier alternative
              </a>
              <a
                href="https://shipstation.ai/site/teacherop-landing-page-8hv6oa8tz/"
                target="_blank"
                className="px-4 py-2 hover:underline"
              >
                TeacherOP - Education Excellence
              </a>
              <a
                href="https://shipstation.ai/site/alexis-ai-companion-55bp42f2x/"
                target="_blank"
                className="px-4 py-2 hover:underline"
              >
                Alexis - AI Companion
              </a>
              <a
                href="https://shipstation.ai/site/tarot-by-sakshi-room_fwxl8u5lx/"
                target="_blank"
                className="px-4 py-2 hover:underline"
              >
                Tarot Card Services - Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecentlyShipped;
