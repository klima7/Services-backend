// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export async function getDownloadUrl(file: any): Promise<string> {
  const meta = await file.getMetadata();
  const token = meta[0].metadata.firebaseStorageDownloadTokens;
  const mediaLink = new URL(meta[0].mediaLink);
  if (mediaLink.toString().includes("localhost")) {
    return mediaLink.protocol + "//" + mediaLink.host + "/v0/b/" + file.bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + token;
  } else {
    return "https://firebasestorage.googleapis.com/v0/b/" + file.bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + token;
  }
}
