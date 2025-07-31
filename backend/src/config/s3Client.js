// utils/s3Client.js
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.BUCKET_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

export default s3;
