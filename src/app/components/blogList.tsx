import { posts } from "../blog/blogs"
import Link from "next/link"

//not used for now

export function BlogList() {
    return (
    <main className="flex h-screen overflow-hidden flex-col items-center p-4 bg-white cursor-default text-black">
        <div className="my-6 mx-auto rounded-lg border-2 border-gray shadow-inner w-[300px] p-4 divide-y-2 md:w-[500px]">
            {posts.map(e=> <div key={e.id} className="flex flex-row space-x-14 md:space-x-60 transition delay-50 duration-300 ease-in-out hover:text-orange-400"><Link href={{pathname: e.name, query: {id: e.id}}} className="flex p-3 cursor-default ">{e.name}</Link><div className="flex place-content-end p-3 max-w-fit">{e.date}</div></div>)}
        </div>
    </main>
    )
}