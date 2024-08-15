'use client'
import Link from "next/link";
import { notFound, useSearchParams  } from "next/navigation";
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import Loading from "../loading";


export default function Page({ params }: { params: { name: string } }) {
  const [upvote, setUpvote] = useState(0);
  const [clicked, setClicked] = useState(false)

  const [content, setContent] = useState('...')
  const [name, setName] = useState('')
  
  const searchParams = useSearchParams()
  const query = searchParams.get('id')

  const [isLoading, setIsLoading] = useState(true)

  const title = params.name

  //fetch data from API (that got data from read)
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

  useEffect(()=> {
    async function checker() {
        const postquery = await fetch('api/getblogcontent', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: query
        })
        const resblogs = await fetch('api/getblogcontent')
        const blogcontent = await resblogs.json()
        const toString = await blogcontent.toString()
        console.log('this is getblog description', toString)
        setContent(toString)
    }
    checker()
},[])

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
    return <main className="flex min-h-screen flex-col items-center p-4 bg-white text-black">
      <div className="mt-20 text-2xl text-bold">{title}</div>
      <div className="my-4 mb-16 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
        <Suspense fallback={ <Loading /> }>
        <div>{content}</div>
        </Suspense>
      </div>
      <div className="flex flex-row">
        <button onClick={sendToApi} className={`mx-2 ${clicked? 'text-orange-400':''}`}>▲</button>
        <div>{upvote}</div>
      </div>
    </main>
  }