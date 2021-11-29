import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();


export const finish = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "User is not authenticated");
  }

  const jobId = data.id;

  await firestore.collection("jobs").doc(jobId).update({active: false});
});
