'use client'
import { useState, useEffect } from 'react'
import Link from "next/link"

//not used for now

export default function BlogList() {
    const [blogposts, setBlogposts] = useState([{id: 0, name: '...', date: '...'}])

    let data:any;
    //add checker if hash(password) == value from DB then let access
    useEffect(()=> {
        async function checker() {
            const resblogs = await fetch('api/blogs')
            const post = await resblogs.json()
            console.log('These are mongodb posts:', post)
            setBlogposts(post)
        }
        checker()
    },[])

    //add form page to add new post with 3 inputs: id, date, name, description
    return (
    <main className="flex h-screen overflow-hidden flex-col items-center p-4 bg-white cursor-default text-black">
        <div className="mt-12 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
            {blogposts.map(e=> <div key={e?.id} className="flex flex-row space-x-14 md:space-x-60 transition delay-50 duration-300 ease-in-out hover:text-orange-400"><Link href={{pathname: e.name, query: {id: e.id}}} className="flex p-3 cursor-default ">{e.name}</Link><div className="flex place-content-end p-3 max-w-fit">{e.date}</div></div>)}
        </div>
        <Link href="/components/addpost" className="m-4 px-2 rounded-lg shadow-inner border-2">+</Link>
    </main>
    )
}