'use client'
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import Loading from "../loading";
import { darkMode } from "../atoms/darkMode";
import { useAtom } from "jotai";
import { use } from "react";

type ParamsType = {
  promise: Promise<{ [key: string]: unknown }>;
  name: string;
};

export default function Page() {

  const [upvote, setUpvote] = useState(0);
  const [clicked, setClicked] = useState(false)

  const [content, setContent] = useState('...')
  
  const title = useParams<{ name: string }>()
  console.log(title)

  const searchParams = useSearchParams()
  const query:any = searchParams.get('id')

  const [isLoading, setIsLoading] = useState(true)

  const [dark] = useAtom(darkMode);

 
  //fetch data from API (that got data from read)


  useEffect(()=> {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
    async function checker() {

        const response = await fetch(`api/blogs`)
        const blogcontent = await response.json()
        console.log('this is getblog description', blogcontent)
        console.log('query:', query)
        let desc = await blogcontent.find((obj:any) => obj.id == query)
        console.log('descr::',desc.description)
        setContent(desc.description)
    }
    checker()
    
},[query])


  useEffect(()=> {
    async function fetchData() {
      try {
        console.log('Fetching data from:', '/api/initial');
        const response = await fetch('/api/initial/', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(query) //remember to transport data in a JSON (JSON.stringify)
        });
        const res = await fetch('/api/initial/')
        console.log(res.status)
        const data = await res.json()
        console.log(data)
        const number = Number(data.number)
        console.log('GET upvote num:',number)
        setUpvote(number)
    } catch(error) {

    }
    }
    fetchData()

  }, [])

  //send data to API
  async function sendToApi() {
    if (clicked == false){
    console.log(query)
    const newUpvoteCount = upvote + 1;
    setUpvote(newUpvoteCount)
    setClicked(true)
    try {
    const response = await fetch('./api/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(query) //remember to transport data in a JSON (JSON.stringify)
    })
    console.log(`sent ${response.json()}`)
  } catch (error) {
    console.log(error)
  }
  }
  else {
    return false
  }
  }


// add edit functionality
    return <main className={`flex min-h-screen flex-col items-center p-4 ${ dark ? "text-white bg-zinc-900" : "text-black bg-white" }`}>
      {isLoading && <Loading />}
      <div className="mt-20 text-2xl text-bold">{title.name}</div>
      {!isLoading && <Loading /> &&
      <div className="my-4 mb-16 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
        <Suspense fallback={ <Loading /> }>
        <div>{content}</div>
        </Suspense>
      </div> }
      <div className="flex flex-row">
        <button onClick={sendToApi} className={`mx-2 text-gray-300 ${clicked? 'text-orange-400':''}`}>▲</button>
        <div>{upvote}</div>
      </div>
    </main>
  }

