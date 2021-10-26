import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();


export const getAvailableIds = functions.https.onCall(async (data, context) => {
  const res = await firestore.collection("jobs").listDocuments();
  const ids = res.map((it) => it.id);
  return ids;
});
