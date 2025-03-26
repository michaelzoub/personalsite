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
import { motion } from "motion/react"
import ContactForm from "./components/contactForm";
import { linkClickStats } from "./utils/linkClickStats";

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
      >I'm (Kafka) Michael Zoubkoff, a computer science student & part time software developer focused on helping humanity progress by improving current technology & building new products.</motion.div>
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
          <Link className="text-sm underline transition delay-50 duration-300 ease-in-out hover:text-orange-400" href="/music">My music taste ↗</Link>
        </motion.div>

        <div className="text-lg mt-6 mx-auto max-w-fit">Software Projects:</div>
        
        <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`${dark ? "bg-zinc-800 text-white" : "bg-gray-300"} p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]`}

          > 
            <div className="flex rounded-lg bg-gray-900 w-[40px] h-[40px] text-white items-center">
              <div className="text-sm font-medium mx-auto my-auto text-center">uMTL</div>
            </div>
            <div className="max-w-fit right-0">uMontreal</div>
            <div className={`${dark ? "text-gray-400" : "text-gray-700"} flex flex-col text-sm my-2`}>Montreal's event and party destination for university/college students.</div>
            <Link href='https://umontreal.vercel.app/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400 text-"
                data-value="/music"
                onClick={(e) => handleLinkClick(e)}>
              Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`${dark ? "bg-zinc-800 text-white" : "bg-gray-300 text-black"} p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]`}

          > 
            <Image src={neptume} width={40} height={40} alt='' className="rounded-lg" />
            <div className="max-w-fit right-0">Neptume</div>
            <div className={`${dark ? "text-gray-400" : "text-gray-700"} flex flex-col text-sm my-2`}>A supercharged crypto wallet that seamlessly integrates multiple chains. Trade, swap, and manage your assets effortlessly with AI-powered intelligence, enhancing your crypto experience at every step.</div>
            <Link href='https://neptume.com/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400 text-"
                data-value="/music"
                onClick={(e) => handleLinkClick(e)}>
              Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`${dark ? "bg-zinc-800 text-white" : "bg-gray-300 text-black"} p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]`}

          > 
            <Image src={earth} width={40} height={40} alt='' className="rounded-lg" />
            <div className="max-w-fit right-0">CEV</div>
            <div className={`${dark ? "text-gray-400" : "text-gray-700"} flex flex-col text-sm my-2`}>A crypto exchange visualizer, exchanges with registered locations show up on the map, the stick height shown depends on the daily BTC volume.</div>
            <Link href='https://cryptoexchangevisual.vercel.app/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400"
                            data-value="/music"
                            onClick={(e) => handleLinkClick(e)}>
              Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={`${dark ? "bg-zinc-800 text-white" : "bg-gray-300 text-black"} p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]`}

          > 
            <Image src={jws} width={40} height={40} alt='' className="rounded-lg" />
            <div className="max-w-fit right-0">Jws.onl</div>
            <div className={`${dark ? "text-gray-400" : "text-gray-700"} flex flex-col text-sm my-2`}>A web app that tracks job postings from select Wall Street and Big Tech companies and sends out notifications to signed up users on new listings.</div>
            <Link href='https://jws-pi.vercel.app/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400"
                                  data-value="/music"
                                  onClick={(e) => handleLinkClick(e)}>
              Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className={`${dark ? "bg-zinc-800 text-white" : "bg-gray-300 text-black"} p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]`}

          > 
            <Image src={cyborg} width={40} height={40} alt='' className="rounded-lg" />
            <div className="max-w-fit right-0">dlock.shop</div>
            <div className={`${dark ? "text-gray-400" : "text-gray-700"} flex flex-col text-sm my-2`}>Skins market being built for Valve's new third-person shooter Deadlock. Currently a work in progress, some functionalities are being added as you read this.</div>
            <Link href='https://market-two-kappa.vercel.app/' className="flex bg-orange-500 w-[121px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400"
                                  data-value="/music"
                                  onClick={(e) => handleLinkClick(e)}>
              In Progress <span className="absolute w-[115px] pl-[91px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span>
            </Link>
          </motion.div>
          
        </div>

      </motion.div>
      <motion.div
                      initial={{opacity: 0, y: 25}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{duration: 0.4}}
                      viewport={{once: true}}
      >

        <div className="text-lg my-2 mx-auto max-w-fit">Contact:</div>

        <motion.div
          className={`flex items-center justify-center ${dark ? "bg-zinc-800 text-zinc-500" : "bg-gray-300 text-zinc-500"} p-4 pt-6 rounded-lg shadow-inner w-[300px] md:w-[500px]`}
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
