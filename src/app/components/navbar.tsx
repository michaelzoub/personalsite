'use client'
import Link from "next/link"
import { useState, useRef, useEffect } from 'react'

export function Navbar() {
    const [button, setButton] = useState(false);
    const [click, setClick] = useState(false);

    const audioRef: any = useRef(null)
    const canvasRef: any = useRef(null)
    const animationRef: any = useRef(null)
  
    useEffect(()=> {
      const canvas: any= canvasRef.current;
      canvas.width = 500;
      canvas.height = 500;
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
        <div className="absolute flex flex-row bg-white p-4 w-full text-black">
            <div className="absolute end-0 ">
                <div className="max-h-fit max-w-fit text-sm mx-auto mr-2"></div>
                <audio ref={audioRef} src="demo.mp3" className="w-56"></audio>
                <div className={button?`hidden`:'absolute text-xs mt-[12.6px] ml-[16.2px] cursor-default'} onClick={togglePlay}>▶</div>
                <canvas ref={canvasRef} className="rounded-full border-gray border-2 mr-6 w-10 h-10" onClick={togglePlay}></canvas>
            </div>
            <div className="mx-auto w-[300px] md:w-[500px] my-auto">
            <Link href="/" className="transition delay-50 duration-300 ease-in-out hover:text-orange-400">Home</Link>
            <Link href="/" className="mx-4 transition delay-50 duration-300 ease-in-out hover:text-orange-400">Blogs</Link>
            </div>
        </div>
    )
}