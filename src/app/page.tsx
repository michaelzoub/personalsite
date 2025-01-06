'use client'
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react'
import BlogList from './components/blogs/page'
import cyborg from '/public/CYBORG.svg'
import jws from '/public/wen.png'
import earth from '/public/earth.jpg'
import spaceship from "/public/spaceship.png"
import { motion } from "motion/react"
//import Bleeg from "./components/bleeg/component/ui";

export default function Home() {

  function handleBlogPost() {

  }

  return (
    <motion.main className="flex flex-col min-h-screen items-center p-4 bg-white text-black overflow-visible">
      <motion.div className="text-xl mt-20 mb-2 mx-6 w-[300px] md:w-[500px]"
                      initial={{opacity: 0, y: 20}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{duration: 0.3}}
                      viewport={{once: true}}
      >I'm Kafka (Michael Zoubkkoff), a computer engineering student & part time software developer focused on helping humanity progress by ameliorating current technology & building new products.</motion.div>
      <motion.div className="mx-auto"
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{duration: 0.5}}
              viewport={{once: true}}
      >
        <div className="text-lg my-4 mx-auto max-w-fit">Software Projects:</div>
        <div className="flex flex-col gap-2 p-3 rounded-lg">
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"
      > 
        <div className="flex rounded-lg bg-zinc-900 w-[40px] h-[40px] text-white items-center">
          <div className="text-sm font-medium mx-auto my-auto text-center">uMTL</div>
        </div>
        <div className="max-w-fit right-0">uMontreal</div>
        <div className="flex flex-col text-sm text-gray-400 my-2">Montreal's event and party destination for university/college students.</div>
        <Link href='https://umontreal.vercel.app/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span></Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"
      > 
        <Image src={spaceship} width={40} height={40} alt='' className="rounded-lg" />
        <div className="max-w-fit right-0">SpaceAI</div>
        <div className="flex flex-col text-sm text-gray-400 my-2">From futuristic space themes to personalized conversations, SpaceAI brings the universe of artificial intelligence right to your fingertips.</div>
        <Link href='https://aiagents-ten.vercel.app/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span></Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"
      > 
        <Image src={earth} width={40} height={40} alt='' className="rounded-lg" />
        <div className="max-w-fit right-0">CEV</div>
        <div className="flex flex-col text-sm text-gray-400 my-2">A crypto exchange visualizer, exchanges with registered locations show up on the map, the stick height shown depends on the daily BTC volume.</div>
        <Link href='https://cryptoexchangevisual.vercel.app/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span></Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"
      > 
        <Image src={jws} width={40} height={40} alt='' className="rounded-lg" />
        <div className="max-w-fit right-0">Jws.onl</div>
        <div className="flex flex-col text-sm text-gray-400 my-2">A web app that tracks job postings from select Wall Street and Big Tech companies and sends out notifications to signed up users on new listings.</div>
        <Link href='https://jws-pi.vercel.app/' className="flex bg-orange-500 w-[90px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">Explore <span className="absolute w-[80px] pl-[60px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span></Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"
      > 
        <Image src={cyborg} width={40} height={40} alt='' className="rounded-lg" />
        <div className="max-w-fit right-0">dlock.shop</div>
        <div className="flex flex-col text-sm text-gray-400 my-2">Skins market being built for Valve's new third person shooter Deadlock. Currently a work in progress, some functionalities are being added as you read this.</div>
        <Link href='https://market-two-kappa.vercel.app/' className="flex bg-orange-500 w-[60px] px-2 gap-2 py-[3px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">WIP <span className="absolute w-[50px] pl-[30px] transition delay-50 duration-300 ease-in-out hover:translate-x-[5px] overflow-hidden">↗</span></Link>
      </motion.div>
        </div>
      </motion.div>
      <motion.div
                      initial={{opacity: 0, y: 25}}
                      whileInView={{opacity: 1, y: 0}}
                      transition={{duration: 0.5}}
                      viewport={{once: true}}
      >
        <div className="text-lg mt-4 mx-auto max-w-fit">Blog:</div>
        <div className="text-sm px-2 mt-2">Powered by <Link href="https://github.com/michaelzoub/bleeg" target="_blank" className="transition delay-150 ease-in-out duration-300 hover:text-orange-500"><span className="text-orange-500">©</span>Bleeg</Link></div>
        <BlogList></BlogList>
      </motion.div>
      <div className="flex flex-col-reverse h-20 mt-12 md:flex bottom-0">© 2024 MIT Licensed</div>
    </motion.main>
  )
}
