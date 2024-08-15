import { NextResponse } from "next/server"
import { connectToDatabase } from "@/app/utils/mongo";

let query:any;

export async function POST(request: Request) {
    console.log('GET getblogcontent hit')
    try {
        query = await request.json()
        console.log('getblogcontent query:',query)
        return NextResponse.json( { status: 200 } )
    } catch(error) {
        return NextResponse.json( { status: 500 } )
    }
}

export async function GET(request: Request) {
    console.log('GET getblogcontent hit')
    try {
        const {db} = await connectToDatabase()
        const collection = await db.collection('posts')
        const posts =  await collection.findOne( {id: query} )
        console.log('query found posts:',posts.description)
        return NextResponse.json(  posts.description  )
    } catch(error) {
        return NextResponse.json( { status: 500 } )
    }
}
