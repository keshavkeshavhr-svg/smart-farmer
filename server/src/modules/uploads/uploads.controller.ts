import { Request, Response, NextFunction } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config';
import { AppError } from '../../middleware/errorHandler';

let s3Client: S3Client | null = null;
if (config.aws.accessKeyId && config.aws.secretAccessKey) {
  s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  });
}

export async function getPresignedUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) throw new AppError(400, 'VALIDATION_ERROR', 'Missing filename or contentType');

    if (!s3Client || !config.aws.bucket) {
      // Return a pseudo-URL for local disk uploads fallback
      return res.json({
        uploadUrl: `/api/uploads/local?filename=${filename}`,
        fileUrl: `/uploads/${filename}`,
        method: 'POST',
      });
    }

    const command = new PutObjectCommand({
      Bucket: config.aws.bucket,
      Key: `uploads/${Date.now()}-${filename.replace(/\s+/g, '-')}`,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const fileUrl = `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${command.input.Key}`;

    res.json({ uploadUrl, fileUrl, method: 'PUT' });
  } catch (err) {
    next(err);
  }
}
