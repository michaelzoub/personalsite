//make sure read and write functions are here
'use server'
import { NextResponse } from 'next/server';
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
  const client1 = await client;
  console.log('POST connected')
  const db = client1.db("upvotes")
  const collection = db.collection("amount")
  const body = await request.json()
  console.log(body)
  const num = new Int32(body)
  console.log(num)
  //delete after
  const result = await collection.updateOne(
    {name: "upvote"},
    {$set: {name: "upvote", number: num}},
    { upsert: true }
  )
  console.log(result)
  return NextResponse.json( {number: body} );
} catch(error) {
  console.log('POST error')
  return NextResponse.json({error: 'Internal error'})
}
}

export async function GET(request: Request) {
  console.log('GET hit')
  try {
  console.log('GET try')
  const client1 = await client;
  console.log('got client')
  const db1 = client1.db("upvotes");
  console.log('accessed database')
  const collection = db1.collection("amount");
  console.log('accessed collection')
  const doc:any = await collection.findOne({name: "upvote"});
  console.log('found query')
  return NextResponse.json({ number: doc.number })
  } catch(error) {
    console.log('GET error')
    return NextResponse.json({error: 'Internal error'})
  }
}
