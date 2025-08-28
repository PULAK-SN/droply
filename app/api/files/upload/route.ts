import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVETE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // parse form data
    const formData = await request.formData();
    const file = formData.get("files") as File;
    const formUserId = formData.get("userId") as string;
    const parentId = (formData.get("parentId") as string) || null;

    if (formUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 401 });
    }

    if (parentId) {
      const [parentFolder] = await db
        .select()
        .from(files)
        .where(
          and(
            eq(files.id, parentId),
            eq(files.userId, userId),
            eq(files.ifFolder, true)
          )
        );
    }
    if (!parentId) {
      return NextResponse.json(
        { error: "Parent folder not found" },
        { status: 401 }
      );
    }

    if (file.type.startsWith("/images") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only images and pdf are supported" },
        { status: 401 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    const folderPath = parentId
      ? `/droply/${userId}/folder/${parentId}`
      : `/droply/${userId}`;

    const originlFileName = file.name;
    const fileExtension = originlFileName.split(".").pop() || "";

    //  check for empty extension
    // validation for not accepting .exe, .php
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const uploadResponse = await imageKit.upload({
      file: fileBuffer,
      fileName: uniqueFileName,
      folder: folderPath,
      useUniqueFileName: false,
    });

    const fileData = {
      name: originlFileName,
      path: uploadResponse.filePath,
      size: file.size,
      type: file.type,
      fileUrl: uploadResponse.url,
      thumbnailUrl: uploadResponse.thumbnailUrl || null,
      userId,
      parentId,
      ifFolder: false,
      isStarred: false,
      ifTrash: false,
    };

    const [newFile] = await db.insert(files).values(fileData).returning();

    return NextResponse.json(newFile);
  } catch (error) {
    return NextResponse.json(
      { error: "Faild to upload file" },
      { status: 401 }
    );
  }
}
