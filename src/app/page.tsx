'use client'
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react'


export default function Home() {
  const [click, setClick] = useState(false);
  const audioRef = useRef(null)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(()=> {
    const canvas = canvasRef.current;
    canvas.width = 50;
    canvas.height = 50;
  }, [])

  function togglePlay() {
    if (click) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current)
    } else {
      audioRef.current.play()
      draw()
    }
    setClick(!click)
  }

  function draw() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    const frequency = 0.01;
    const amplitude = 25;
    const yCenter = canvas.height / 2;
    const lineLength = 0.1;
    const gap = 0.2;

    for (let x = 0; x < canvas.width; x+= lineLength + gap) {
      const y = yCenter + amplitude * Math.sin((x + audioRef.current.currentTime * 100) * frequency)
      context.beginPath(x,yCenter);
      context.moveTo(x, y);
      context.lineTo(x + lineLength, y);
      context.stroke();
    }
    context. strokeStyle = '#222222'
    context.lineWidth = 2;

    animationRef.current = requestAnimationFrame(draw);
  }
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-white">
      <div className="absolute end-0 ">
        <div className="max-h-fit max-w-fit text-sm mx-auto mr-2">Current favorite song:</div>
        <audio ref={audioRef} src="demo.mp3" className="w-56"></audio>
        <canvas ref={canvasRef} className="rounded-lg border-gray border-2 mx-auto" onClick={togglePlay}></canvas>
      </div>
      <div className="text-xl my-24 mx-6 w-[300px] md:w-[500px]">I'm Kafka (Michael Zoubkkoff), a computer engineering student & part time software developer focused on helping humanity progress by ameliorating & building technology.</div>
      <div className="mx-auto">
        <div className="text-lg my-6 mx-auto max-w-fit">Software:</div>
        <div className="bg-gray-200 p-4 rounded-lg border-black shadow-inner w-[300px] md:w-[500px]"> 
          <Image src='/wen.png' width={40} height={40} alt='' className="rounded-lg"></Image>
          <div className=" max-w-fit right-0">Wen.market</div>
          <div className="flex flex-col text-sm text-gray-400 my-2">A kickstarter application built on Optimism targeting everyday users to invest in startups in exchange for the project's tokens.</div>
          <Link href='' className="bg-orange-500 p-[5px] rounded-lg shadow-inner transition delay-50 duration-300 ease-in-out hover:bg-orange-400">Explore ↗</Link>
        </div>
      </div>
      <div>
        <div className="text-lg m-6 mx-auto">Blog:</div>
      </div>
    </main>
  );
}
