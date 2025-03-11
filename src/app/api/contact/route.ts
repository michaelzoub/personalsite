import { NextRequest, NextResponse } from "next/server";
import { nodeMailer } from "@/app/utils/nodemailer";

export async function POST(req: NextRequest) {
    try {
        //form data:
        const data = await req.json();
        await nodeMailer(data.from, data.subject, data.text)
        return NextResponse.json({
            message: "Success"
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}