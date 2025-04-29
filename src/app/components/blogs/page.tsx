'use client'
import { useState, useEffect } from 'react'
import Link from "next/link"
import { useAtom } from 'jotai'
import { darkMode } from '@/app/atoms/darkMode'
import { getLocalStorage, setLocalStorage } from '@/app/utils/localStorage'

interface BlogList {
    bg: string
}

export default function BlogList() {
    const [blogposts, setBlogposts] = useState([{id: 0, name: '...', date: '...'},])
    const [dark] = useAtom(darkMode);

    //add checker if hash(password) == value from DB then let access
    useEffect(()=> {
        async function checker() {
            const objects = getLocalStorage();
            const stringified = JSON.parse(objects || `{}`);
            let post;
            if (!objects || stringified.date !== new Date().toISOString().split('T')[0]) {
                const resblogs = await fetch('/api/blogs')
                post = await resblogs.json()
                //console.log('These are mongodb posts:', post)
                //reorder blogs:
                post.reverse();
                setLocalStorage(post);
            } else {
                post = stringified.array;
            }
            setBlogposts(post);
        }
        checker()
    },[])

    //add form page to add new post with 3 inputs: id, date, name, description
    return (
    <main className={`${dark ? "flex overflow-hidden flex-col items-center bg-zinc-900 cursor-default text-white" : "flex overflow-hidden flex-col items-center bg-white cursor-default text-black"}`}>
        <div className={`mx-auto rounded-lg border-2 ${dark ? "border-zinc-800 divide-zinc-800" : "border-gray"} shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]`}>
            {Array.isArray(blogposts) ? blogposts.map((e) => <Link key={e?.id} href={`/${e.name}?id=${e?.id}`} className="flex flex-col flex-wrap cursor-default md:transition delay-50 duration-300 ease-in-out hover:text-orange-400"><div><div className="float-left max-w-fit p-3">{e.name}</div><div className="float-right p-3 max-w-fit">{e?.date}</div></div></Link>) : <p>Loading blog posts...</p>}
        </div>
        <Link href="/addpost" className="m-4 px-2 rounded-lg shadow-inner border-2">+</Link>
    </main>
    )
}