import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Security check: Only allow requests with the correct secret key
    const secret = request.headers.get('x-mail-bridge-secret');
    if (secret !== process.env.MAIL_BRIDGE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized mail bridge access' }, { status: 401 });
    }

    const { to, subject, html, text } = data;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Configure nodemailer transporter using environment variables on Vercel
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT || 465),
      secure: Number(process.env.MAIL_PORT || 465) === 465, // true for 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"SmartShop" <noreply@smartshop.com>',
      to,
      subject,
      text,
      html,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Mail Bridge Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
