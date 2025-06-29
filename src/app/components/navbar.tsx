'use client'
import Link from "next/link"
import { useState, useRef, useEffect } from 'react'
import { motion } from "motion/react";
import { PanInfo } from "framer-motion";
import { useAtom } from "jotai";
import { darkMode } from "../atoms/darkMode";
import { hoverAtom } from "../atoms/hover";
import X from "./x";

export function Navbar() {
    const [button, setButton] = useState(false);
    const [click, setClick] = useState(false);
    const [dark, setDark] = useAtom(darkMode);
    const [hover, setHover] = useAtom(hoverAtom);
    const [tooltip, setTooltip] = useState(true);

    const audioRef: any = useRef(null)
    const canvasRef: any = useRef(null)
    const animationRef: any = useRef(null)

    const [mobile, setMobile] = useState(false);

    const [progress, setProgress] = useState(0);
    const duration = 351;
    let dragging = false;

    useEffect(() => {
      if (!audioRef.current) return;
      const updateProgress = () => {
        setProgress(audioRef.current.currentTime);
      };
      audioRef.current.addEventListener("timeupdate", updateProgress);
      return () => audioRef.current?.removeEventListener("timeupdate", updateProgress);
    }, []);
  
    useEffect(()=> {
      const canvas: any= canvasRef.current;
      canvas.width = 500;
      canvas.height = 500;
    }, [])

    //check for mobile
    useEffect(() => {
      function isMobile() {
        return window.innerWidth <= 768;
      }
      
      if (isMobile()) {
        setMobile(true);
      } 
    },[])
  
  
    function togglePlay() {
      setTooltip(false);
      setTimeout(() => {

      console.log("Toggle click played")
      if (dragging) {
        return;
      }
      if (click) {
        audioRef.current.pause();
        cancelAnimationFrame(animationRef.current)
      } else {
        audioRef.current.play()
        draw()
      }
      setClick(!click)
      setButton(true)
    }, 10)
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

    function handleDrag(_: MouseEvent | TouchEvent, info: PanInfo) {
      console.log("dragging true")
      dragging = true;
      const newTime = Math.min(
        duration,
        Math.max(0, (progress + info.delta.x / 5)) // Adjust scaling factor
      );
      setProgress(newTime);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
      console.log("dragging false")
      dragging = false;
    }
  
    return (
        <div className={`absolute flex flex-row p-4 w-full z-50 ${dark ? "bg-zinc-900 text-white" : "bg-white text-black"}`}>
          <div className="absolute end-0 h-fit">
            <motion.div className="absolute end-0"
                whileTap={{ scale: 1.2 }}
                drag="x"
                onDrag={handleDrag}
                dragConstraints={{ left: 0, right: 0 }}
              >
                  <div className="max-h-fit max-w-fit text-sm mx-auto mr-2"></div>
                  <audio ref={audioRef} src="demo.mp3" className="w-56"></audio>
                  <div className={button?`hidden`:'absolute text-xs mt-[12.6px] ml-[16px] cursor-default'} onClick={togglePlay}>▶</div>
                  <canvas ref={canvasRef} className="rounded-full border-gray border-2 mr-6 w-10 h-10" onClick={togglePlay}></canvas>
              </motion.div>
              <motion.div className="mr-[80px] flex flex-row"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: tooltip ? 1 : 0, opacity: tooltip ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="w-[148px] py-1 px-2 bg-zinc-700 text-white rounded-lg text-xxs md:text-xs md:py-2">
                  Drag left or right to skip through the song.
                </div>
                <div className="text-zinc-700 mt-[12px] absolute ml-[147px] text-xxs">▶</div>
              </motion.div>
          </div>
            <div className="flex flex-row mx-auto w-[300px] md:w-[500px] my-auto justify-between">
              <div>
                <Link href="/" className="transition delay-50 duration-300 ease-in-out hover:text-orange-400">Home</Link>
                <Link href="/components/blogpage" prefetch={true} className="mx-4 transition delay-50 duration-300 ease-in-out hover:text-orange-400">Blogs</Link>
              </div>
              <div className={`${mobile ? "hidden" : "flex flex-row gap-10"}`}>
                <motion.div className="flex flex-row gap-4 w-fit"
                  initial={{ opacity: 0, x: 100, scale: 0 }}
                  animate={{ opacity: hover ? 1 : 0, x: hover ? 0 : 100, scale: hover ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X></X>
                  <div className="mx- transition delay-50 duration-300 ease-in-out hover:text-orange-400 w-fit hover:cursor-pointer"  onClick={() => setDark(true)}>Dark</div>
                  <div className="mx- transition delay-50 duration-300 ease-in-out hover:text-orange-400 w-fit hover:cursor-pointer"  onClick={() => setDark(false)}>Light</div>
                </motion.div>
                <a className="mx- transition delay-50 duration-300 ease-in-out hover:text-orange-400 w-fit hover:cursor-pointer" onMouseEnter={() => setHover(true)}>Mode</a>
              </div>
            </div>
        </div>
    )
}