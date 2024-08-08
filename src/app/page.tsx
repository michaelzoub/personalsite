'use client'
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react'
import { posts } from "./blog/blogs"

export default function Home() {

  return (
    <main className="flex h-screen overflow-hidden flex-col items-center p-4 bg-white cursor-default text-black">
      <div className="text-xl mt-20 mb-2 mx-6 w-[300px] md:w-[500px]">I'm Kafka (Michael Zoubkkoff), a computer engineering student & part time software developer focused on helping humanity progress by ameliorating current technology & building new products.</div>
      <div className="mx-auto">
        <div className="text-lg my-4 mx-auto max-w-fit">Software:</div>
        <div className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"> 
          <Image src='/wen.png' width={40} height={40} alt='' className="rounded-lg"></Image>
          <div className=" max-w-fit right-0">Wen.market</div>
          <div className="flex flex-col text-sm text-gray-400 my-2">A kickstarter application built on Optimism, letting users invest in startups in exchange for a share of the project's tokens.</div>
          <Link href='' className="bg-orange-500 p-[5px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">WIP ☗</Link>
        </div>
      </div>
      <div>
        <div className="text-lg my-4 mx-auto max-w-fit">Blog:</div>
        <div className="my-6 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
          {posts.map(e=> <div key={e.id} className="flex flex-row space-x-14 md:space-x-60 transition delay-50 duration-300 ease-in-out hover:text-orange-400"><Link href={{pathname: e.name, query: {id: e.id}}} className="flex p-3 cursor-default ">{e.name}</Link><div className="flex place-content-end p-3 max-w-fit">{e.date}</div></div>)}
        </div>
      </div>
      <div className="m-14 md:absolute bottom-0 m-2">© 2024 MIT Licensed</div>
    </main>
  )
}
