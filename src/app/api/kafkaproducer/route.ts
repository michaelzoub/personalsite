import { NextRequest, NextResponse } from "next/server";
import { Kafka } from "kafkajs";

export async function POST(req: NextRequest) {
    //get request
    const body = await req.json();
    try {   
        //create a producer
        const kafka = new Kafka({
            clientId: 'my-app',
            brokers: ['localhost:9092'],
          });

        const producer = kafka.producer();

        await producer.connect();
        await producer.send({
        topic: 'linkClicks',
        messages: [
            { value: JSON.stringify({ href: body.href, quantity: body.quantity }) }
        ],
        });

        await producer.disconnect()
    } catch (error) {
        return NextResponse.json({ error: error, status: 400 });
    }
}