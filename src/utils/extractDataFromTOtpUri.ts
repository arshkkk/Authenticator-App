import TOtpAppType from "../types/TOtpApp";

export default function extractSecretIssuerAndUsername(
  uri: string,
): TOtpAppType {
  // Regular expression to match the URI format
  const uriRegex = /^otpauth:\/\/totp\/([^?]+)\?secret=([^&]+)&issuer=([^&]+)/;

  // Match the URI against the regex
  const match = uri.match(uriRegex);
  if (!match) {
    throw new Error("Invalid URI format");
  }

  // Extract username from the path component
  const username = match[1];

  // Parse the URI to get query parameters
  const queryParams = new URLSearchParams(uri.split("?")[1]);

  // Extract secret and issuer from the query parameters
  const secret = queryParams.get("secret");
  const issuer = queryParams.get("issuer");

  return {
    secret: decodeURI(secret),
    issuer: decodeURI(issuer),
    username: decodeURI(username),
  };
}
