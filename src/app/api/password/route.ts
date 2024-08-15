'use server'
import { connectToDatabase } from '@/app/utils/mongo'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    console.log('GET hit')
    try {
        console.log('GET trying')
        const { db } = await connectToDatabase()
        const collection = db.collection('users')
        console.log('accessed collection')
        const doc:any = await collection.findOne({username: 'michael'})
        console.log(doc.password)
        const pw = doc.password
        return NextResponse.json({body: doc.password})
    } catch(error) {
        console.log('GET password error')
        return NextResponse.json({status: 500})
    }
}