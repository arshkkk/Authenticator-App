import TOtpAppType from "../types/TOtpApp";

export default function extractDataFromTOtpUri(uri: string): TOtpAppType {
  console.log(uri);
  // Regular expression to match the URI format
  const uriRegex =
    /^otpauth:\/\/totp\/([^:]+):([^?]+)\?secret=([^&]+)&issuer=([^&]+)/;

  // Match the URI against the regex
  const match = uri.match(uriRegex);
  if (!match) {
    throw new Error("Invalid URI format");
  }

  // Extract username, secret, and issuer from the regex groups
  const username = match[2];
  const secret = match[3];
  const issuer = match[4];

  return { secret, issuer, username };
}
