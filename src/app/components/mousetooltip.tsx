import { useState, useEffect } from "react";

export default function MouseTooltip() {

    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [visibility, setVisibility] = useState(true);

    useEffect(() => {
        function handleMouseMovement(event: MouseEvent) {
            setPosition({
                x: event.clientX + 10,
                y: event.clientY + 10
            })
        }

        window.addEventListener("mousemove", handleMouseMovement);
        window.addEventListener("mousedown", () => setVisibility(false))

        return () => {
            window.removeEventListener("mousemove", handleMouseMovement);
        }
    }, [])

    return (
        <div>
            <div className={`w-fit py-1 px-2 bg-zinc-700 text-white rounded-lg text-xxs md:text-xs md:py-2 z-[10000] ${visibility ? "visible" : "hidden"}`}
            style={{
                position: "absolute",
                left: `${position.x}px`,
                top: `${position.y}px`}}
            >Hold RMB to move around.</div>
        </div>
    )
}