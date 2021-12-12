import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


const firestore = admin.firestore();


export const deleteAccount = functions.https.onCall(async (_data, context) => {
  console.log("Deleting account");

  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  await firestore.collection("experts").doc(uid).delete();
});
