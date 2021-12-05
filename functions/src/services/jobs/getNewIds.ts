import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


const firestore = admin.firestore();


export const getNewIds = functions.https.onCall(async (_data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const newIds = (await firestore.collection("matches")
      .where("new", "array-contains", uid)
      .orderBy("creationDate")
      .select()
      .get()).docs.map((it)=>it.id);

  return newIds.reverse();
});
