import { Suspense, useState, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "motion/react"
import { projects } from "../data/projects";
import Image from "next/image";
import Link from "next/link";
import { darkMode } from "../atoms/darkMode";
import { useAtom } from "jotai";

interface Project {
  id: string;
  name: string;
  iconType: 'text' | 'image';
  iconText?: string;
  iconSrc?: any; 
  description: string;
  url: string;
  buttonText: string;
  buttonWidth: string;
  arrowPosition: string;
  screenshotUrl?: string;
}

interface PageProps {
  project: typeof projects[0]; 
  dark: boolean; 
  delay: number; 
  handleLinkClick: (e: any) => void;
}

export default function ProjectCard({ project, dark, delay, handleLinkClick }: PageProps) {
  const [isHovered, setIsHovered] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const [shouldLoadIframe, setShouldLoadIframe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadIframe(true);
    }, delay * 1000 + 500); 
    
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(project.name)}
  onMouseLeave={() => setIsHovered("")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative w-[300px] md:w-[500px]"
      
    >
      <div className={`${dark ? "bg-gradient-to-b from-zinc-800 to-zinc-900 text-white" : "bg-gradient-to-b from-gray-200 to-gray-300 border border-gray-400/50"} p-4 rounded-lg shadow-inner relative z-10`}>
        {project.iconType === 'text' ? (
          <div className="flex rounded-lg bg-gray-900 w-[40px] h-[40px] text-white items-center">
            <div className="text-sm font-medium mx-auto my-auto text-center">{project.iconText}</div>
          </div>
        ) : (
          <Image src={project.iconSrc} width={40} height={40} alt='' className="rounded-lg" />
        )}
        <div className="max-w-fit right-0">{project.name}</div>
        <div className={`${dark ? "text-gray-400" : "text-gray-700"} flex flex-col text-sm my-2`}>{project.description}</div>
        <Link href={project.url} className={`flex bg-gradient-to-r from-orange-400 to-orange-500 ${project.buttonWidth} px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:shadow-black/20 relative z-20`}
            data-value="/music"
            onClick={(e) => handleLinkClick(e)}>
          {project.buttonText} <span className={`absolute w-[80px] ${project.arrowPosition} transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden`}>↗</span>
        </Link>
      </div>

        <AnimatePresence key={project.id}>
        <Head>
            <link rel="preload" href={project.url} as="document" />
        </Head>
        {(isHovered == project.name) && (
            <>
              <div className="absolute left-full top-0 w-4 h-full hidden lg:block" />
              <motion.div
              
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute left-full top-0 ml-4 w-[400px] h-[300px] rounded-xl overflow-hidden shadow-2xl border-2 z-30 hidden lg:block ${dark ? "border-gray-700" : "border-gray-300"}`}
              >
              <div className="relative w-full h-full bg-white">
                  {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <Image
                      src={project.screenshotUrl}
                      alt={`${project.name} preview`}
                      className="w-full h-full object-cover"
                      priority={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/50 to-blue-400/60 animate-pulse" />
                  </div>
                  )}

                  {shouldLoadIframe && (
                  <iframe
                      src={project.url}
                      className={`w-full h-full rounded-xl transition-opacity duration-500 ${
                      iframeLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      title={`Preview of ${project.name}`}
                      sandbox="allow-scripts allow-same-origin"
                      onLoad={() => setIframeLoaded(true)}
                  />
                  )}

                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                  {!iframeLoaded ? "Loading" : "Live Preview"}
                  </div>
              </div>
              </motion.div>
            </>
        )}
        </AnimatePresence>
    </motion.div>
  );
}