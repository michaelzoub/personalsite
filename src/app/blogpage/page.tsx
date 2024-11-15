import BlogList from "../components/blogs/page"

export default function Blogpage() {
    return (
        <main className="flex flex-col items-center p-4 pt-20 bg-white text-black h-screen md:overflow-hidden md:h-screen">
            <BlogList></BlogList>
        </main>
    )
}