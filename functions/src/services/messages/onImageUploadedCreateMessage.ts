import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {getDownloadUrl} from "../../utils/firestore";

const firestore = admin.firestore();
const bucket = admin.storage().bucket();


export const onImageUploadedCreateMessage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  if (filePath == undefined) {
    throw new functions.https.HttpsError("internal", "No file path");
  }

  if (!filePath.startsWith("chats_images/")) {
    return;
  }

  // Validate path length
  const segments = filePath.split("/");
  if (segments.length != 4) {
    await bucket.file(filePath).delete();
    console.log("Invalid path");
    return;
  }

  const offerId = segments[1];
  const uid = segments[2];

  const offer = await (await firestore.collection("offers").doc(offerId).get()).data();

  // Check if offer exists
  if (offer == undefined) {
    await bucket.file(filePath).delete();
    console.log("Offer doesn't exist");
    return;
  }

  let author;

  if (uid == offer.clientId) {
    author = "client";
  } else if (uid == offer.expertId) {
    author = "expert";
  } else {
    await bucket.file(filePath).delete();
    console.log("User is not member of given offer");
    return;
  }

  // Create message
  const data = {
    author: author,
    imageUrl: await getDownloadUrl(bucket.file(filePath)),
    time: admin.firestore.FieldValue.serverTimestamp(),
    type: 1,
  };

  await firestore.collection("offers").doc(offerId).collection("messages").add(data);
});
