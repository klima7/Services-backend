import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";

const firestore = admin.firestore();


export const onProfileImageDeleted = functions.storage.object().onDelete(async (object) => {
  const filePath = object.name;
  if (filePath == undefined) {
    throw new functions.https.HttpsError("internal", "No file path");
  }

  if (!filePath.startsWith("profile_images/")) {
    return;
  }

  const uid = path.parse(filePath).name;

  const data = {
    profileImage: null,
  };

  await firestore.collection("experts").doc(uid).update(data);
});
