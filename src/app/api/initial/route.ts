'use server'
import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '@/app/utils/mongo';
import {Int32} from 'mongodb';

let body:any;

export async function POST(request: Request) {
    console.log('POST hit')
    try {
        await connectToDatabase()
        body = await request.json()
        console.log('initial query: API',body)
        return NextResponse.json(body)
    } catch(error) {
        console.log('initial POST error')
        return NextResponse.json({error: 'Internal error'})
    }
}

export async function GET(request: NextRequest) {
    console.log('GET hit');
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      const { db } = await connectToDatabase();
      const collection = await db.collection("amount");
      console.log("id: ", id)
      const doc: any = await collection.findOne({ id: Number(id) });
      console.log(doc)
      return NextResponse.json({ number: doc.number });
    } catch (error) {
      console.error('GET error', error);
      return NextResponse.json({ error: 'Internal error' });
    }
  }