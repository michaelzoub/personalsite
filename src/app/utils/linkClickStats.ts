export async function linkClickStats(href: string): Promise<void> {
    const response = await fetch("/api/kafkaproducer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            href: href,
            quantity: 1
        })
    })
}