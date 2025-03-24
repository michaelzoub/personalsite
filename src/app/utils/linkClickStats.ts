export async function linkClickStats(href: string) {
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
    const data = await response.json();
    console.log(data);
}