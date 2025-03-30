"use client"
import { useAtom } from "jotai"
import { darkMode } from "./atoms/darkMode"

export default function Loading() {

    const [dark] = useAtom(darkMode);

    return (
        <main className={`absolute min-h-screen flex flex-col items-center p-4 cursor-default overflow-hidden ${ dark ? "text-white bg-zinc-900" : "text-black bg-white" }`}>
            <div className="mt-14 titlesmall md:title"></div>
            <div className="my-4 kafkasmall md:kafka"></div>
        </main>
    )
}