'use client'
import {useEffect, useState, createContext, useContext} from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { cookies } from 'next/headers'

const apiKey= process.env.STEAM_API

export default function callback() {
    const [response, setResponse] = useState("")
    const [user, setUser] = useState("")
    const [imageurl, setImageurl] = useState("")
    useEffect(() => {
        async function fun() {
            const urlParams = new URLSearchParams(window.location.search);
            console.log('url params:',urlParams)
            const claim = urlParams.get('openid.claimed_id')
            console.log('claim:',claim)
            if (claim) {
                console.log(claim)
                const id:any = claim.split("/").pop()
                setResponse(id)
                const playerName = await fetch(`http://localhost:8080/api/here`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(id),
                    credentials: 'include'
                })  
                const username = await playerName.json()
                console.log(username.name)
                setUser(username.name)
                setImageurl(username.profilePicture)
            } else {
                console.log("Error")
                setResponse("Error")
            }
        }
        setTimeout(() => {
            fun()
        }, 500)
    },[])

    return (
        <main className="z-10 flex min-h-screen flex-col items-center bgblack gap-8 text-white overflow-auto overflow-x-hidden">
            <div className="mt-36">{response}</div>
            <div>{user}</div>
            <Image src={imageurl} alt="User's profile picture." width={50} height={50}></Image>
        </main>
    )
}