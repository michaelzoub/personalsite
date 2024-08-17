import BlogList from "../blogs/page"

export default function Blogpage() {
    return (
        <main className="flex flex-col items-center p-4 bg-white text-black h-screen md:overflow-hidden md:h-screen">
            <BlogList></BlogList>
        </main>
    )
}