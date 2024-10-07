'use client'
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react'
import BlogList from './components/blogs/page'
import cyborg from '/public/CYBORG.svg'
import jws from '/public/wen.png'

export default function Home() {

  return (
    <main className="flex flex-col min-h-screen items-center p-4 bg-white text-black overflow-visible">
      <div className="text-xl mt-20 mb-2 mx-6 w-[300px] md:w-[500px]">I'm Kafka (Michael Zoubkkoff), a computer engineering student & part time software developer focused on helping humanity progress by ameliorating current technology & building new products.</div>
      <div className="mx-auto">
        <div className="text-lg my-4 mx-auto max-w-fit">Software Projects:</div>
        <div className="flex flex-col gap-2 h-64 overflow-x-scroll border-2 border-gray p-3 rounded-lg shadow-inner">
        <div className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"> 
          <Image src={jws} width={40} height={40} alt='' className="rounded-lg"></Image>
          <div className=" max-w-fit right-0">Jws.onl</div>
          <div className="flex flex-col text-sm text-gray-400 my-2">A web app that tracks job postings from select Wall Street and Big Tech companies and sends out notifications to signed up users on new listings.</div>
          <Link href='https://jws-pi.vercel.app/' className="bg-orange-500 p-[5px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">Explore ↗</Link>
        </div>
        <div className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"> 
            <Image src={cyborg} width={40} height={40} alt='' className="rounded-lg"></Image>
            <div className=" max-w-fit right-0">dlock.shop</div>
          <div className="flex flex-col text-sm text-gray-400 my-2">Skins market being built for Valve's new third person shooter Deadlock. Currently a work in progress, some functionalities are being added as you read this.</div>
          <Link href='https://market-two-kappa.vercel.app/' className="bg-orange-500 p-[5px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">WIP ↗</Link>
        </div>
        </div>
      </div>
      <div>
        <div className="text-lg mt-4 mx-auto max-w-fit">Blog:</div>
        <BlogList></BlogList>
      </div>
      <div className="flex flex-col-reverse h-20 mt-12 md:flex bottom-0">© 2024 MIT Licensed</div>
    </main>
  )
}
