import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

interface S3DeletePageOptions {
  basePath: string | undefined;
  uri: string;
  bucketName: string;
  buildId: string;
  region: string;
}

export const s3DeletePage = async (options: S3DeletePageOptions) => {
  const s3 = new S3Client({
    region: options.region,
    maxAttempts: 3
  });

  const s3BasePath = options.basePath
    ? `${options.basePath.replace(/^\//, "")}/`
    : "";
  const baseKey = options.uri
    .replace(/^\/$/, "index")
    .replace(/^\//, "")
    .replace(/\.(json|html)$/, "")
    .replace(/^_next\/data\/[^\/]*\//, "");
  const jsonKey = `_next/data/${options.buildId}/${baseKey}.json`;
  const htmlKey = `static-pages/${options.buildId}/${baseKey}.html`;

  const s3JsonParams = {
    Bucket: options.bucketName,
    Key: `${s3BasePath}${jsonKey}`
  };

  const s3HtmlParams = {
    Bucket: options.bucketName,
    Key: `${s3BasePath}${htmlKey}`
  };

  await Promise.all([
    s3.send(new DeleteObjectCommand(s3JsonParams)),
    s3.send(new DeleteObjectCommand(s3HtmlParams))
  ]);
};
