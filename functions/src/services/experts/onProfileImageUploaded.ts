import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";
import {getDownloadUrl} from "../../utils/firestore";
import {Expert, ExpertUpdate} from "../../interfaces/firestore";

const firestore = admin.firestore();
const bucket = admin.storage().bucket();


export const onProfileImageUploaded = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  if (filePath == undefined) {
    throw new functions.https.HttpsError("internal", "No file path");
  }

  if (!filePath.startsWith("profile_images/")) {
    return;
  }

  const uid = path.parse(filePath).name;

  // Check whether user has expert account
  const expert = (await firestore.collection("experts").doc(uid).get()).data() as Expert;
  if (expert == null) {
    throw new functions.https.HttpsError("failed-precondition", "User does not have expert account");
  }

  const expertData: Partial<ExpertUpdate> = {
    profileImage: {
      url: await getDownloadUrl(bucket.file(filePath)),
      changeTime: admin.firestore.FieldValue.serverTimestamp(),
    },
  };

  await firestore.collection("experts").doc(uid).update(expertData);
});
