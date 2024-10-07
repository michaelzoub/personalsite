'use client'

export default function Test() {

    const hero = {
        hero: 'shiv',
        rarity: 'exotic'
    }

     async function handleTest() {
        const response = await fetch('http://localhost:8080/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hero)
        })
        console.log(response.body)
    }
    return (
        <main className="flex min-h-screen flex-row items-center bg-zinc-800 gap-8 text-white">
            <div>test</div>
            <button className="mt-20" onClick={handleTest}>Test</button>
        </main>
    )
}