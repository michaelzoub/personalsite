import { DotmCircular3 } from "@/components/ui/dotm-circular-3"

export default function Loading() {
    return (
        <main className="route-loading" aria-busy="true">
            <DotmCircular3 color="var(--ink)" bloom ariaLabel="Loading page" />
        </main>
    )
}
