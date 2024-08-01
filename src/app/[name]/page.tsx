import { Suspense } from 'react'
import Link from "next/link";
import { posts } from "../blogs"
import { notFound,  } from "next/navigation";



export default async function Page({ params }: { params: { name: string } }) {

  await new Promise(resolve => setTimeout(resolve,1000))
  let post = params.name

  let description = ''

for (let i = 0; i < posts.length; i ++) {
  if (posts[i].name == post) {
     description = posts[i].description
  }
} 

// add edit functionality
    return <main className="flex min-h-screen flex-col items-center p-4 bg-white text-black">
      <Link href="/" className="absolute start-0 px-2 mx-4 rounded-full bg-orange-500 p-[5px] shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">←</Link>
      <div className="my-16 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
        <div>{description}</div>
      </div>
    </main>
  }