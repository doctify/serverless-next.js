import lambdaAtEdgeCompat from "@sls-next/next-aws-cloudfront";
// @ts-ignore
import Manifest from "./manifest.json";
import {
  OriginRequestDefaultHandlerManifest,
  RegenerationEvent
} from "./types";
import { s3StorePage } from "./s3/s3StorePage";
import { renderPageToHtml } from "@sls-next/core";
import { s3DeletePage } from "./s3/s3DeletePage";
import pMap from "p-map";

export const handler = async (event: AWSLambda.SQSEvent): Promise<void> => {
  console.log(JSON.stringify(event), "REGENERATION EVENT");

  await pMap(
    event.Records,
    async (record) => {
      try {
        const regenerationEvent: RegenerationEvent = JSON.parse(record.body);
        const manifest: OriginRequestDefaultHandlerManifest = Manifest;
        const { req, res } = lambdaAtEdgeCompat(
          { request: regenerationEvent.cloudFrontEventRequest },
          { enableHTTPCompression: manifest.enableHTTPCompression }
        );

        const page = require(`./${regenerationEvent.pagePath}`);

        const { renderOpts, html } = await renderPageToHtml(
          page,
          req,
          res,
          "passthrough"
        );

        const normalizedUri = decodeURI(regenerationEvent.pageS3Path)
          .replace(`static-pages/${manifest.buildId}`, "")
          .replace(/.js$/, "");

        if (renderOpts.isNotFound) {
          await s3DeletePage({
            uri: normalizedUri,
            basePath: regenerationEvent.basePath,
            bucketName: regenerationEvent.bucketName,
            buildId: manifest.buildId,
            region: regenerationEvent.region
          });
          return;
        }

        await s3StorePage({
          html,
          uri: normalizedUri,
          basePath: regenerationEvent.basePath,
          bucketName: regenerationEvent.bucketName,
          buildId: manifest.buildId,
          pageData: renderOpts.pageData,
          region: regenerationEvent.region,
          revalidate: renderOpts.revalidate as number
        });
      } catch (err) {
        console.error("Error processing SQS record:", err);
      }
    },
    {
      concurrency: 3
    }
  );
};
