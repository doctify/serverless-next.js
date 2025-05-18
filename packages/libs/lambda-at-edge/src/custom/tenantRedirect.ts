import { CloudFrontRequest } from "aws-lambda";

const redirectsMap = {
  AE: "/en-ae",
  AT: "/de-at",
  DE: "/de",
  AU: "/au",
  IE: "/ie",
  SA: "/en-sa"
};

const handleTenantRedirect = ({ headers }: CloudFrontRequest) => ({
  status: "301",
  statusDescription: "Found",
  headers: {
    location: [
      {
        key: "Location",
        value:
          redirectsMap[
            headers["cloudfront-viewer-country"][0]
              .value as keyof typeof redirectsMap
          ] || "/uk"
      }
    ]
  }
});

export default handleTenantRedirect;
