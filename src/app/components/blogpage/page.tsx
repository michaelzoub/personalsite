"use client"
import BlogList from "../blogs/page"
import { useAtom } from "jotai"
import { darkMode } from "@/app/atoms/darkMode"

export default function Blogpage() {

    const [dark] = useAtom(darkMode);

    return (
        <main className={`flex flex-col items-center p-4 pt-20 bg-white text-black h-screen md:overflow-hidden md:h-screen ${ dark ? "text-white bg-zinc-900" : "text-black bg-white" }`}>
            <BlogList></BlogList>
        </main>
    )
}