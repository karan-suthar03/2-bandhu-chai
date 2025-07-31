import {PutObjectCommand} from '@aws-sdk/client-s3';
import s3 from "../config/s3Client.js";
import * as crypto from "node:crypto";
import * as path from "node:path";

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;

export async function uploadFile(params) {

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: params.fileName,
        Body: params.buffer,
        ContentType: params.mimeType,
    });
    await s3.send(command);

    return `https://${bucketName}.s3.${region}.amazonaws.com/${params.fileName}`;
}