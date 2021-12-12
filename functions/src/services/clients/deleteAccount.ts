import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


const firestore = admin.firestore();
const auth = admin.auth();


export const deleteAccount = functions.https.onCall(async (_data, context) => {
  // Delete client
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }
  await firestore.collection("clients").doc(uid).delete();

  // Delete user if no accounts
  const expert = await firestore.collection("experts").doc(uid).get();
  if (!expert.exists) {
    await auth.deleteUser(uid);
  }
});
