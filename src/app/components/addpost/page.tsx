'use client'
import { useState, useEffect } from 'react'
import { hash } from "@/app/utils/cryptohash"
import { darkMode } from '@/app/atoms/darkMode'
import { useAtom } from 'jotai'

export default function Add() {

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const [password, setPassword] = useState('')
    const [access, setAccess] = useState(false)
    const [mongopw, setMongopw] = useState()
    const [error, setError] = useState('')

    const [dark] = useAtom(darkMode);

    const postData = {
        id: 0,
        date: '',
        name: title,
        description: description
    }

    let data;

    useEffect(()=> {
        async function checker() {
            const res = await fetch('/api/password')
            data = await res.json()
            console.log(data.body)
            setMongopw(data.body)
        }
        checker()
    },[])

    async function handleSubmit(e:any) {
        e.preventDefault()
    const today =  new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    postData.date = dateString
        const response = await fetch('/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
              },
            body: JSON.stringify(postData)
        })
        console.log(response)
    }

    //check if user has access
    function handleSubmitLogin(e:any) {
        e.preventDefault() 
        const pw = hash(password)
        //add check if tested password == hash
        if (mongopw == pw) {
            setAccess(true)
            console.log('Access granted.')
        } else {
            setError(password)
            console.log(error)
            console.log(`The hash is ${mongopw} good luck cracking it hahahaha.`)
        }
    }

    return (
        <main className={`flex h-screen overflow-hidden flex-col items-center p-4 cursor-default ${ dark ? "text-white bg-zinc-900" : "text-black bg-white" }`}>
            <div className="mt-20 text-xl">Welcome back <i>Michael.</i></div>
            <div className={`${access? 'hidden' : 'h-screen w-full'}`}>
                <form className="flex flex-col mx-auto max-w-fit" onSubmit={handleSubmitLogin}>
                    <input placeholder="Username" className="border-2 my-2 p-1 w-[300px] md:w-[500px]"></input>
                    <input placeholder="Password" type="password" className="border-2 p-1 w-[300px] md:w-[500px]" onChange={(e)=> setPassword(e.target.value)} value={password}></input>
                    <button onClick={handleSubmitLogin} className="mx-auto m-2 border-2 shadow-inner rounded-full px-4 max-w-fit">❯</button>
                </form>
                <div className={`${error? 'mx-auto w-72 border-2 rounded-lg p-2 border-orange-500 shadow-inner' : 'hidden'}`}>Smh <u>{error}</u> is the wrong password, get good hehe.</div>
            </div>
            <div className={`${access? 'flex flex-col' : 'hidden'}`}>
                <form className={`flex flex-col w-full mt-20`} onSubmit={handleSubmit}>
                    <input placeholder="Title" className="mx-auto p-1 border-2 rounded-lg border-gray-100 w-[300px] md:w-[500px]" value={title} onChange={(e)=> setTitle(e.target.value)}></input>
                    <textarea placeholder="Description" className="mx-auto w-[350px] my-6 p-1 border-2 rounded-lg border-gray-100 h-56 resize-none md:w-[550px]" value={description} onChange={(e)=> setDescription(e.target.value)}></textarea>
                </form>
                <button onClick={handleSubmit} className="bg-orange-500 p-[5px] rounded-lg shadow-inner max-w-fit mx-auto transition delay-50 duration-300 ease-in-out hover:bg-orange-400">Booom!</button>
            </div>
        </main>
    )
}