import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();


export const getNewIds = functions.https.onCall(async (_data, _context) => {
  const res = await firestore.collection("jobs").listDocuments();
  const ids = res.map((it) => it.id);
  return ids;
});


export const getRejectedIds = functions.https.onCall(async (_data, _context) => {
  const res = await firestore.collection("jobs").listDocuments();
  const ids = res.map((it) => it.id);
  return ids;
});

export const getJobStatus = functions.https.onCall(async (_data, _context) => {
  // 0 - new
  // 1 - rejected
  // 2 - accepted
  return {
    status: 1,
  };
});


export const accept = functions.https.onCall(async (_data, _context) => {
  console.log("Accepting job");
});


export const reject = functions.https.onCall(async (_data, _context) => {
  console.log("Rejecting job");
});


export const finish = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "User is not authenticated");
  }

  const jobId = data.id;

  await firestore.collection("jobs").doc(jobId).update({active: false});
});


export const create = functions.https.onCall(async (_data, _context) => {
  console.log("Creating job");
  await new Promise((f) => setTimeout(f, 500));
});
