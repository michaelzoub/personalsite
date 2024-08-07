//make sure read and write functions are here
'use server'
import { NextResponse } from 'next/server';
import {readFile} from '../../server/readFile'
import { updateFile } from '@/app/server/updateFile';

//receive data from front end

//declare funtion and add cases for 'GET' and 'POST'

//so i have to make seperate functions for GET and PUT because of the APP router -> look more into this soon

//make sure i always error handle to see what happens: try & catch

export async function GET(request: Request) {
  console.log('GET hit')
  try {
    console.log('calling GET')
    const data = await readFile()
    console.log(data)
    return NextResponse.json({ data })
  } catch(error) {
    console.log(error)
    console.log('GET error')
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('POST HIT')
  try {
    console.log('trying POST')
    const data = await request.json()
    console.log(data)
    updateFile(data)
    return NextResponse.json({message: 'file update succesfully'},{ status: 200 });
  }
  catch(error) {
    console.log('POST error')
  }
}

