'use client'
import { Suspense } from 'react'
import Link from "next/link";
import { posts } from "../blog/blogs"
import { notFound,  } from "next/navigation";
import { useState, useEffect } from 'react';
import { error } from 'console';


export default function Page({ params }: { params: { name: string } }) {

  const [upvote, setUpvote] = useState(0);
  const [clicked, setClicked] = useState(false)

  //fetch data from API (that got data from read)
  useEffect(()=> {
    async function fetchData() {
      try {
        console.log('Fetching data from:', '/api/route');
        const res = await fetch('/api/route/');
        console.log(res.status)
        const data = await res.json()
        console.log(data)
        const number = Number(data.number)
        console.log(number)
        setUpvote(number)
    } catch(error) {

    }
    }
    fetchData()

  }, [])

  //send data to API
  async function sendToApi() {
    if (clicked == false){
    const newUpvoteCount = upvote + 1;
    setUpvote(newUpvoteCount)
    setClicked(true)
    try {
    const response = await fetch('./api/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(newUpvoteCount) //remember to transport data in a JSON (JSON.stringify)
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

  let post = params.name

  let description = '';
  let title = '';

for (let i = 0; i < posts.length; i ++) {
  if (posts[i].name == post) {
     description = posts[i].description
     title = posts[i].name
  }
} 

// add edit functionality
    return <main className="flex min-h-screen flex-col items-center p-4 bg-white text-black">
      <div className="mt-20 text-2xl text-bold">{title}</div>
      <div className="my-4 mb-16 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
        <div>{description}</div>
      </div>
      <div className="flex flex-row">
        <button onClick={sendToApi} className={`mx-2 ${clicked? 'text-orange-400':''}`}>▲</button>
        <div>{upvote}</div>
      </div>
    </main>
  }