"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const EditorScroll = () => {
  const appImage = useRef<HTMLImageElement>(null);
  const { scrollYProgress } = useScroll({
    target: appImage,
    offset: ["start end", "end end"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <div className="bg-black text-white py-[72px] sm:py-24" id="how-it-works">
      <div className="container">
        <h2 className="text-center text-5xl font-bold tracking-tighter">
          Intituve interface
        </h2>
        <div className="max-w-xl mx-auto">
          <p className="text-xl text-white/70 text-center mt-5 ">
            Chat with your project and refine your site easily. Drag and drop
            images to use and let our AI handle all the coding!
          </p>
        </div>
        <div className="flex justify-center">
          <motion.div
            style={{
              opacity: opacity,
              rotateX: rotateX,
              transformPerspective: "800px",
            }}
          >
            <Image
              src={"/project-editor.png"}
              ref={appImage}
              alt="project editor"
              className="mt-14"
              width={1000}
              height={1000}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
