"use server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const uploadSchema = z.object({
  file: z.instanceof(File),
});

export const uploadFile = async (file: File) => {
  try {
    const result = uploadSchema.safeParse({ file });
    if (!result.success) {
      return { error: "Invalid file upload", status: 400 };
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${uuidv4()}`;
    const fileName = `${
      path.parse(file.name).name
    }-${uniqueSuffix}${path.extname(file.name)}`;
    const filePath = path.join(uploadsDir, fileName);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    const fileUrl = `/uploads/${fileName}`;
    return { path: fileUrl, status: 200 };
  } catch (error) {
    return { error: "File upload failed", status: 500 };
  }
};

export default uploadFile;
