import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  const { password } = await req.json();

  if (!expected || password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('mevo_admin', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8
  });
  return res;
}
