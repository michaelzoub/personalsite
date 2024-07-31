'use client'
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react'
import { posts } from "./blogs"
import { Suspense } from 'react'

export default function Home() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(false);
  const [form, setForm] = useState(
    {name: '',
      email: '',
      subject: ''
    }
  )
  const [status, setStatus] = useState('')


  const audioRef: any = useRef(null)
  const canvasRef: any = useRef(null)
  const animationRef: any = useRef(null)

  useEffect(()=> {
    const canvas: any= canvasRef.current;
    canvas.width = 500;
    canvas.height = 500;
  }, [])

  async function handleSubmit(e:any) {
    e.preventDefault()
    const response = await fetch('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })
    if (response.ok) {
      setStatus('OKAY!')
      setForm({ name: '', email: '', subject: ''})
      console.log(status)
    } else {
      setStatus('Try again.')
      console.log(status)
    }
  }


  function handleInput(e:any) {
    setForm({... form, [e.target.name] : e.target.value})
  }

  function togglePlay() {
    if (click) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current)
    } else {
      audioRef.current.play()
      draw()
    }
    setClick(!click)
    setButton(true)
  }



  function draw() {
    const canvas: any = canvasRef.current;
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    const frequency = 0.05;
    const amplitude = 50;
    const yCenter = canvas.height / 2;
    const lineLength = 1;
    const gap = 0.0001;

    for (let x = 0; x < canvas.width; x+= lineLength + gap) {
      const y = yCenter + amplitude * Math.sin((x + audioRef.current.currentTime * 200) * frequency)
      context.beginPath(x,yCenter);
      context.moveTo(x, y);
      context.lineTo(x + lineLength, y);
      context.stroke();
    }
    context. strokeStyle = '#ea580c'
    context.lineWidth = 50;

    animationRef.current = requestAnimationFrame(draw);
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-white cursor-default text-black">
      <div className="absolute end-0 ">
        <div className="max-h-fit max-w-fit text-sm mx-auto mr-2"></div>
        <audio ref={audioRef} src="demo.mp3" className="w-56"></audio>
        <Suspense>
        <div className={button?`hidden`:'absolute mt-4 ml-[23px] cursor-default'} onClick={togglePlay}>▶</div>
        </Suspense>
        <canvas ref={canvasRef} className="rounded-full border-gray border-2 mr-6 w-14 h-14" onClick={togglePlay}></canvas>
      </div>
      <div className="text-xl my-16 mx-6 w-[300px] md:w-[500px]">I'm Kafka (Michael Zoubkkoff), a computer engineering student & part time software developer focused on helping humanity progress by ameliorating current technology & building new products.</div>
      <div className="mx-auto">
        <div className="text-lg my-6 mx-auto max-w-fit">Software:</div>
        <div className="bg-gray-200 p-4 rounded-lg shadow-inner w-[300px] md:w-[500px]"> 
          <Image src='/wen.png' width={40} height={40} alt='' className="rounded-lg"></Image>
          <div className=" max-w-fit right-0">Wen.market</div>
          <div className="flex flex-col text-sm text-gray-400 my-2">A kickstarter application built on Optimism, letting users invest in startups in exchange for a share of the project's tokens.</div>
          <Link href='' className="bg-orange-500 p-[5px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">WIP ☗</Link>
        </div>
      </div>
      <div>
        <div className="text-lg my-6 mx-auto max-w-fit">Blog:</div>
        <div className="my-6 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
          {posts.map(e=> <div key={e.id} className="flex flex-row space-x-16 md:space-x-60 transition delay-50 duration-300 ease-in-out hover:text-orange-400"><Link href={{pathname: e.name, query: {id: e.id}}} className="flex p-3 cursor-default ">{e.name}</Link><div className="flex place-content-end p-3 max-w-fit">{e.date}</div></div>)}
        </div>
      </div>
      <div>
        <div>Contact</div>
        <form className="" onSubmit={handleSubmit}>
          <input className="rounded-lg border-2 border-black p-1" placeholder="Name" name="name" value={form.name} onChange={handleInput} required></input>
          <input className="rounded-lg border-2 border-black p-1 m-2" placeholder="E-mail" name="email" value={form.email} onChange={handleInput} required></input>
          <input className="rounded-lg border-2 border-black p-1" placeholder="Subject" name="subject"  value={form.subject} onChange={handleInput} required></input>
          <button className="m-2 items-center bg-orange-500 p-[5px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400"></button>
        </form>
        </div>
      <div>© 2024 MIT Licensed</div>
    </main>
  )
}
