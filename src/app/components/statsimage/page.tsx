'use client'
import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas';
import { Suspense } from 'react';
import Loading from '../loading';

//get user data from context and use useEffect to get total trades + account valuation + gains over time

export default function ImageCaptureStatsPage() {
    const ref = useRef(null)
    const [imgSrc, setImgSrc] = useState<String>()
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 5000);
  
      // Clean up the interval and timeout when the component unmounts
      return () => {
        clearTimeout(timeout);
      };
    }, []);

    useEffect(() => {
        const captureImage = async () => {
            if (ref.current) {
                const canvas = await html2canvas(ref.current);
                 setTimeout(() => {
                    const imgData = canvas.toDataURL('image/png');
                    setImgSrc(imgData); // Set the image source to display it
                    const newTab: any = window.open();
                    newTab.document.body.innerHTML = `<img src="${imgData}" alt="Stats for user." />`
                    window.location.href = "/";
                }, 5000)
            } else {
                console.log('component null')
            }
          };
          captureImage()
    }, [])

    return (
    
    <main className="w-full h-screen justify-center items-center bgblack pt-20 px-8">
        {loading ? <Loading /> : <div>Content Loaded!</div>}
        <div className="w-[600px] h-[350px] flex flex-col text-3xl gap-4 mx-auto p-4 justify-between statsbackground rounded-md text-white" ref={ref}>
            <div className="flex flex-col gap-2">
                <div className="font-medium">GAINS WITH DLOCK.SHOP</div>
                <div className="text-4xl font-semibold">NAME</div>
            </div>
            <div className="flex flex-row gap-6">
                <div>Trades completed:
                    <div>0</div>
                </div>
                <div>Account valuation:
                    <div>0</div>
                </div>
            </div>
            <div className="font-bold redaccenttext">Gains : 0%</div>
        </div>
        
    </main>
    )
}