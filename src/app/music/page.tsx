"use client"
//import { Navbar } from "../components/navbar"
import dynamic from "next/dynamic";
//import MusicGraph from "../components/musicVisual/graph"

const MusicPlayer = dynamic(() => import("../components/musicVisual/graph"), { ssr: false });

export default function Test() {
    return (
        <main className="h-screen w-full">
            <MusicPlayer></MusicPlayer>
        </main>
    )
}