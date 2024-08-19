import { NextResponse } from "next/server"
import { connectToDatabase } from "@/app/utils/mongo";

let query:any;

export async function GET(request: Request) {
    console.log('GET getblogcontent hit')
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('id')
        const {db} = await connectToDatabase()
        const collection = await db.collection('posts')
        const posts =  await collection.findOne( {id: query} )
        console.log('query found posts:',posts.description)
        return NextResponse.json(  posts.description  )
    } catch(error) {
        return NextResponse.json( { status: 500 } )
    }
}
