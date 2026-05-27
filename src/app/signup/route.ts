import { NextResponse } from "next/server";

const SIGNUP_FORM_URL = "https://forms.gle/c4udK1WJFdwHa4Dy7";

export function GET() {
  return NextResponse.redirect(SIGNUP_FORM_URL, 308);
}
