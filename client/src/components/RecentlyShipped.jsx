import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Code, ExternalLink, CircleFadingPlus, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

const RecentlyShipped = () => {
  const { myProjectsLoading, recentlyShipped, user } = useContext(AuthContext);

  const featuredWebsites = [
    {
      name: "Sam Altman - Spotify themed portfolio",
      url: "https://shipstation.ai/site/sam-altman-spotify-portfolio-66Qmav1g/",
    },
    {
      name: "Neon portfolio",
      url: "https://shipstation.ai/site/neel-seth-8-bit-neon-portfolio-null/",
    },
    {
      name: "Ray Kroc - Tribute Portfolio",
      url: "https://shipstation.ai/site/ray-kroc-tribute-portfolio-room_tpq5did89//",
    },
    {
      name: "Vintage Ink Emporium",
      url: "https://shipstation.ai/site/vintage-ink-emporium-SvxCZNk0/",
    },
    {
      name: "TeacherOP - Education Excellence",
      url: "https://shipstation.ai/site/teacherop-landing-page-8hv6oa8tz/",
    },
    {
      name: "Tankr Design portfolio",
      url: "https://shipstation.ai/site/rachit-tank-tankr-design-portfolio-room_njf2lirzu/",
    },
    {
      name: "Alexis - AI Companion",
      url: "https://shipstation.ai/site/alexis-ai-companion-55bp42f2x/",
    },
    {
      name: "Tarot Card Services - Portfolio",
      url: "https://shipstation.ai/site/tarot-by-sakshi-room_vcmdpyfb9/",
    },
  ];

  const handleWebsitesClick = () => {
    window.open("https://shipstation.ai/all", "_blank");
  };

  return (
    <div className="w-full py-8">
      <section className="mx-auto px-4 md:px-8">
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">
              <Code className="inline-block w-5 h-5 mr-2" />
              my projects
            </h2>
            <div className="flex flex-wrap gap-4 mb-8">
              {myProjectsLoading && user ? (
                Array(4)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse bg-muted rounded-lg h-10 w-64"
                    ></div>
                  ))
              ) : recentlyShipped.length > 0 ? (
                recentlyShipped.map((ship, index) => (
                  <Link
                    key={index}
                    to={`/project/${ship.slug}`}
                    className="text-cerulean hover:text-berkeley-blue border border-cerulean rounded-lg px-4 py-2 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    {ship.slug}
                  </Link>
                ))
              ) : (
                <div className="text-gray-400 border border-gray-700 p-8 rounded flex items-center">
                  <CircleFadingPlus className="w-12 h-12 mr-8" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      No projects yet
                    </h3>
                    <p>Start shipping to see your creations here!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="inline-block w-5 h-5 mr-2" />
                featured websites
              </h2>
              <Button
                // className="font-medium bg-muted px-2 py-1 rounded-full"
                variant="outline"
                onClick={handleWebsitesClick}
              >
                check all websites shipped! <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
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
