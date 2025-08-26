import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { error } from "console";

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVETE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const authParams = imageKit.getAuthenticationParameters();

    return NextResponse.json(authParams);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Faild to generate authentication parameters for imagekit",
      },
      { status: 500 }
    );
  }
}
