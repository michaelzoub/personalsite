//make sure read and write functions are here
'use server'
import { NextResponse } from 'next/server';
import {connectToDatabase} from '@/app/utils/mongo';
import client from '@/app/utils/mongo';
import {Int32} from 'mongodb'

//receive data from front end

//declare funtion and add cases for 'GET' and 'POST'

//so i have to make seperate functions for GET and PUT because of the APP router -> look more into this soon

//make sure i always error handle to see what happens: try & catch

export async function POST(request: Request) {
  console.log('POST hit')
  try{
  console.log('POST try')
  const { db } = await connectToDatabase()
  console.log('POST connected')
  const collection = db.collection("amount")
  const result = await collection.updateOne(
    {name: "upvote"},
    { $inc: { number: 1 } },
    { upsert: true }
  )
  console.log(result)
  return NextResponse.json( {status: 200} );
} catch(error) {
  console.log('POST error')
  return NextResponse.json({error: 'Internal error'})
}
}

export async function GET(request: Request) {
  console.log('GET hit')
  try {
  console.log('GET try')
  const { db } = await connectToDatabase()
  console.log('connected to MongoDB and got database')
  const collection = await db.collection("amount");
  console.log('accessed collection')
  const doc:any = await collection.findOne({name: "upvote"})
  console.log('found query')
  return NextResponse.json({ number: doc.number })
  } catch(error) {
    console.log('GET error')
    return NextResponse.json({error: 'Internal error'})
  }
}
