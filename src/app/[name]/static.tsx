export async function generateStaticParams() {
  const posts: any = await fetch('api/getblogcontent').then((res) => res.json())
 
  return posts.map((post:any) => ({
    name: post.name,
  }))
}
