import { NextResponse } from "next/server";
import { chatGPTSignOutPath, getChatGPTUser, safeRelativeReturnPath } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safeRelativeReturnPath(url.searchParams.get("return_to"));
  const chatGPTUser = await getChatGPTUser();
  return NextResponse.redirect(new URL(chatGPTUser ? chatGPTSignOutPath(returnTo) : returnTo, url.origin));
}
