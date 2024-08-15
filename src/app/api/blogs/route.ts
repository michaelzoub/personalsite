'use server'
//this might be a temporary file since I'm already storing blog posts in the blog folder, might migrate to MongoDB soon
import { NextResponse } from "next/server";
import {connectToDatabase} from '@/app/utils/mongo';
import {Int32} from 'mongodb'

//receives title and description from /components/addpost and increments id and sets time automatically
export async function POST(request: Request) {
    console.log('POST createpost hit')
    try {
        const body = await request.json()
        console.log(body)
        const { db } = await connectToDatabase()
        console.log('POST connected to db blogs')
        const collection = await db.collection('posts')
        console.log('POST connected to collection blogs')
        const biggestId = await collection.findOne({}, { sort: { id: -1 } })
        console.log(biggestId.id)
        body.id = biggestId.id + 1
        console.log(body.id)
        collection.insertOne(body)
        return NextResponse.json({status:200})
    } catch(error) {
        console.log('POST createpost error')
        return NextResponse.json({status:500})
    }
}

//gets blogs from MongoDB
export async function GET(request: Request) {
    console.log('GET blogs hit')
    try {
        const { db } = await connectToDatabase()
        console.log('GET connected to db blogs')
        const collection = await db.collection('posts')
        console.log('GET accessed collection blogs')
        const posts =  await collection.find( {} ).toArray()
        console.log(posts)
        return NextResponse.json(posts)
    } catch(error) {
        return NextResponse.json({status:500})
    }
}