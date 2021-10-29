import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();


export const getNewIds = functions.https.onCall(async (data, context) => {
  const res = await firestore.collection("jobs").listDocuments();
  const ids = res.map((it) => it.id);
  return ids;
});


export const getRejectedIds = functions.https.onCall(async (data, context) => {
  const res = await firestore.collection("jobs").listDocuments();
  const ids = res.map((it) => it.id);
  return ids;
});


export const accept = functions.https.onCall(async (data, context) => {
  console.log("Accepting job");
});


export const reject = functions.https.onCall(async (data, context) => {
  console.log("Rejecting job");
});
