'use client'
import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { darkMode } from "./atoms/darkMode";
import BlogList from './components/blogs/page'
import cyborg from '/public/CYBORG.svg'
import jws from '/public/wen.png'
import earth from '/public/earth.jpg'
import neptume from '/public/neptune3.jpg'
import { motion, AnimatePresence } from "motion/react"
import ContactForm from "./components/contactForm";
import { linkClickStats } from "./utils/linkClickStats";
import { Suspense, useState, useEffect } from "react";
import Head from "next/head";

import cev from '/public/cev.jpg'
import umontreal from '/public/umontreal.jpg'
import neptumePrev from '/public/neptume.jpg'
import dlockPrev from '/public/dlockPrev.jpg'
import jwsPrev from '/public/jwsPrev.jpg'

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

const projects = [
  {
    id: 'umontreal',
    name: 'uMontreal',
    iconType: 'text',
    iconText: 'uMTL',
    description: "Montreal's event and party destination for university/college students.",
    url: 'https://umontreal.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : umontreal
  },
  {
    id: 'neptume',
    name: 'Neptume',
    iconType: 'image',
    iconSrc: neptume,
    description: 'A supercharged crypto wallet that seamlessly integrates multiple chains. Trade, swap, and manage your assets effortlessly with AI-powered intelligence, enhancing your crypto experience at every step.',
    url: 'https://neptume.com/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : neptumePrev
  },
  {
    id: 'cev',
    name: 'CEV',
    iconType: 'image',
    iconSrc: earth,
    description: "A crypto exchange visualizer, exchanges with registered locations show up on the map, the stick height shown depends on the daily BTC volume.",
    url: 'https://cryptoexchangevisual.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : cev
  },
  {
    id: 'jws',
    name: 'Jws.onl',
    iconType: 'image',
    iconSrc: jws,
    description: 'A web app that tracks job postings from select Wall Street and Big Tech companies and sends out notifications to signed up users on new listings.',
    url: 'https://jws-pi.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : jwsPrev
  },
  {
    id: 'dlock',
    name: 'dlock.shop',
    iconType: 'image',
    iconSrc: cyborg,
    description: "Skins market being built for Valve's new third-person shooter Deadlock. Currently a work in progress, some functionalities are being added as you read this.",
    url: 'https://market-two-kappa.vercel.app/',
    buttonText: 'Explore',
    buttonWidth: 'w-[90px]',
    arrowPosition: 'pl-[60px]',
    screenshotUrl : dlockPrev
  }
];

function ProjectCard({ project, dark, delay, handleLinkClick }: PageProps) {
  const [isHovered, setIsHovered] = useState(false);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative w-[300px] md:w-[500px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

<AnimatePresence>
  <Head>
    <link rel="preload" href={project.url} as="document" />
  </Head>
  {isHovered && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute left-full top-0 ml-4 w-[400px] h-[300px] rounded-xl overflow-hidden shadow-2xl border-2 border-gray-300 dark:border-gray-700 z-30 hidden lg:block"
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
  )}
</AnimatePresence>
    </motion.div>
  );
}

export default function Home() {

  const [dark] = useAtom(darkMode);

  const handleLinkClick = (e: any) => {
    const value = e.target.getAttribute('data-value') || e.currentTarget.getAttribute('data-value');
    linkClickStats(value);
    console.log(value);
  };

  return (
    <motion.main className={`${dark ? "flex flex-col min-h-screen items-center p-4 bg-zinc-900 text-white overflow-visible" : "flex flex-col min-h-screen items-center p-4 bg-white text-black overflow-visible"}`}>
      <motion.div className="text-xl mt-20 mb-2 mx-6 w-[300px] md:w-[500px]"
                  initial={{opacity: 0, y: 20}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{duration: 0.3}}
                  viewport={{once: true}}
      >Welcome to my little space on this thing known as the world wide web. I study the universe by day, work as a silicon shape shifter by night and reshape my thoughts into ink during my free time.</motion.div>
      <motion.div className="mx-auto"
                  initial={{opacity: 0, y: 20}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{duration: 0.5}}
                  viewport={{once: true}}
      >

        <motion.div className="w-[300px] md:w-[500px] mx-6"
                    initial={{opacity: 0}}
                    whileInView={{opacity: 1}}
                    transition={{duration: 0.05}}
                    viewport={{once: true}}
                    data-value="/music"
                    onClick={handleLinkClick}
        >
          <Link className="text-orange-600 text-sm underline transition delay-50 duration-300 ease-in-out hover:text-orange-400" href="/music">My music taste ↗</Link>
        </motion.div>

        <div className="text-lg mt-6 mx-auto max-w-fit">Software Projects:</div>
        
        <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg">
          {projects.map((project, idx) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              dark={dark} 
              delay={0.6 + idx * 0.1}
              handleLinkClick={handleLinkClick}
            />
          ))}
        </div>

      </motion.div>
      <motion.div
                      initial={{opacity: 0, y: 25}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{duration: 0.4}}
                      viewport={{once: true}}
      >

        <div className="text-lg my-2 mx-auto max-w-fit">Send me a message:</div>

        <motion.div
          className={`flex items-center justify-center ${dark ? "bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-500" : "bg-gradient-to-b from-gray-200 to-gray-300 text-zinc-500"} p-4 pt-6 rounded-lg shadow-inner w-[300px] md:w-[500px]`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileInView={{opacity: 1, y: 0}}
        >
          <ContactForm dark={dark}></ContactForm>
        </motion.div>

        <div className="text-lg mt-4 my-1 mx-auto max-w-fit">Blog:</div>
        <div className="text-sm px-2 mt-">Powered by <Link href="https://github.com/michaelzoub/bleeg" target="_blank" className="transition delay-150 ease-in-out duration-300 hover:text-orange-500"><span className="text-orange-500" data-value="/music"
                onClick={(e) => handleLinkClick(e)}>©</span>Bleeg</Link></div>
        <BlogList></BlogList>
      </motion.div>
      <div className="flex flex-col-reverse h-20 mt-12 md:flex bottom-0">© {new Date().getFullYear()} MIT Licensed</div>
    </motion.main>
  )
}