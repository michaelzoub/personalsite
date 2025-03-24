import { NextRequest, NextResponse } from "next/server";
import { Kafka, Partitioners } from "kafkajs";

export async function POST(req: NextRequest) {
    //get request
    const body = await req.json();
    try {   
        //create a producer
        const kafka = new Kafka({
            clientId: 'my-app', 
            brokers: ['pkc-619z3.us-east1.gcp.confluent.cloud:9092'], 
            sasl: {
              mechanism: 'plain', 
              username: process.env.KAFKA_KEY || (""),
              password: process.env.KAFKA_SECRET || ("")
            },
            ssl: true, 
          });

          const producer = kafka.producer({
            createPartitioner: Partitioners.LegacyPartitioner, 
          });

        await producer.connect();
        await producer.send({
        topic: 'topic_0',
        messages: [
            { value: JSON.stringify({ href: body.href, quantity: body.quantity }) }
        ],
        });

        await producer.disconnect()

        return NextResponse.json({ message: "Success", status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error, status: 400 });
    }
}