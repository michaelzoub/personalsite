'use client'
import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { darkMode } from "./atoms/darkMode";
import BlogList from './components/blogs/page'
import { motion, AnimatePresence } from "motion/react"
import ContactForm from "./components/contactForm";
import { linkClickStats } from "./utils/linkClickStats";
import { projects } from "./data/projects";
import ProjectCard from "./components/ProjectCard";

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