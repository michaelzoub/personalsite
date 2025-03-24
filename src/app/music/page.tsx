"use client"
import dynamic from "next/dynamic";

const MusicPlayer = dynamic(() => import("../components/musicVisual/graph"), { ssr: false });

export default function Test() {
    return (
        <main className="h-screen w-full">
            <MusicPlayer></MusicPlayer>
        </main>
    )
}