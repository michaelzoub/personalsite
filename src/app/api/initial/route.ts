'use server'
import { NextResponse } from 'next/server';
import {connectToDatabase} from '@/app/utils/mongo';
import {Int32} from 'mongodb'

let body:any;

export async function POST(request: Request) {
    console.log('POST hit')
    try {
        await connectToDatabase()
        body = await request.json()
        console.log(body)
        return NextResponse.json(body)
    } catch(error) {
        console.log('initial POST error')
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
    //turn body to Int32:
    const id = new Int32(body)
    const doc:any = await collection.findOne({id: id})
    console.log('found query')
    return NextResponse.json({ number: doc.number })
    } catch(error) {
      console.log('GET error')
      return NextResponse.json({error: 'Internal error'})
    }
  }