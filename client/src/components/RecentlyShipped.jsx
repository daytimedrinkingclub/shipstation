import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Separator } from "@/components/ui/separator"
import { Code, Trophy, ExternalLink, CircleFadingPlus } from "lucide-react";

const RecentlyShipped = () => {
  const {myProjectsLoading, recentlyShipped, user } = useContext(AuthContext);

  const featuredWebsites = [
    { name: "N times Y - The Curiosity App", url: "https://shipstation.ai/site/n-times-y-the-curiosity-app-vhzphn8pn/" },
    { name: "HookSumo - Zapier alternative", url: "https://shipstation.ai/site/hooksumo-pu6hbyt5d/" },
    { name: "TeacherOP - Education Excellence", url: "https://shipstation.ai/site/teacherop-landing-page-8hv6oa8tz/" },
    { name: "Alexis - AI Companion", url: "https://shipstation.ai/site/alexis-ai-companion-55bp42f2x/" },
    { name: "Tarot Card Services - Portfolio", url: "https://shipstation.ai/site/tarot-by-sakshi-room_fwxl8u5lx/" },
  ];

  return (
    <div className="text-white w-full  py-8">
      <section className="mx-auto px-4 md:px-8">
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">
              <Code className="inline-block w-5 h-5 mr-2" />
              my projects
            </h2>
            <div className="flex flex-wrap gap-4 mb-8">
              {(myProjectsLoading && user) ? (
                Array(4).fill().map((_, index) => (
                  <div key={index} className="animate-pulse bg-gray-700 rounded-lg h-10 w-64"></div>
                ))
              ) : recentlyShipped.length > 0 ? (
                recentlyShipped.map((ship, index) => (
                  <a
                    key={index}
                    href={`${import.meta.env.VITE_BACKEND_URL}/site/${ship.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cerulean hover:text-berkeley-blue border border-cerulean rounded-lg px-4 py-2 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    {ship.slug}
                  </a>
                ))
              ) : (
                <div className="text-gray-400 bg-gray-800 p-8 rounded flex items-center">
                  <CircleFadingPlus className="w-12 h-12 mr-8" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p>
                      Start shipping to see your creations here!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">
              <Trophy className="inline-block w-5 h-5 mr-2 stroke-yellow-500" />
              featured websites
            </h2>
            <div className="flex flex-wrap gap-4">
              {featuredWebsites.map((site, index) => (
                <a
                  key={index}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 hover:underline flex items-center"
                >
                  {site.name}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecentlyShipped;