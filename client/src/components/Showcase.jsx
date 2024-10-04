import React, { useState, useEffect } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import { supabase } from "@/lib/supabaseClient";
import AppLayout from "@/components/layout/AppLayout";

const Showcase = () => {
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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Website Showcase</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <FocusCards
            cards={generatedWebsites.map((website) => ({
              src: `https://api.microlink.io?url=https://shipstation.ai/site/${website.slug}&screenshot=true&meta=false&embed=screenshot.url`,
              url: `https://shipstation.ai/site/${website.slug}`,
              onClick: () =>
                window.open(
                  `https://shipstation.ai/site/${website.slug}`,
                  "_blank"
                ),
            }))}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Showcase;
