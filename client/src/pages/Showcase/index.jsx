import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FocusCards } from "@/components/ui/focus-cards";
import { supabase } from "@/lib/supabaseClient";
import AppLayout from "@/components/layout/AppLayout";

const Showcase = () => {
  const baseUrl = import.meta.env.VITE_MAIN_URL; //https://shipstation.ai
  const navigate = useNavigate();

  const [generatedWebsites, setGeneratedWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGeneratedWebsites();
  }, []);

  const fetchGeneratedWebsites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ships")
        .select("prompt, slug, portfolio_type, id")
        .order("id", { ascending: false })
        .limit(50); // Increased limit for showcase page

      if (error) throw error;
      setGeneratedWebsites(data);
    } catch (error) {
      console.error("Error fetching generated websites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const skeletonCards = Array(12)
    .fill()
    .map((_, index) => ({
      id: `skeleton-${index}`,
      isSkeleton: true,
    }));

  const handleWebsiteSelection = (website) => {
    navigate("/", {
      state: {
        customDesignPrompt: website.prompt,
        portfolioType: website.portfolio_type,
      },
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Portfolio Showcase</h1>
        <FocusCards
          cards={
            isLoading
              ? skeletonCards
              : generatedWebsites.map((website) => ({
                  src: `https://api.microlink.io?url=${baseUrl}/site/${website.slug}&screenshot=true&meta=false&embed=screenshot.url`,
                  url: `${baseUrl}/site/${website.slug}`,
                  onClick: () =>
                    window.open(
                      `https://shipstation.ai/site/${website.slug}`,
                      "_blank"
                    ),
                }))
          }
        />
      </div>
    </AppLayout>
  );
};

export default Showcase;
