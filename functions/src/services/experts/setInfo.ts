import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();


interface SetInfoParams {
  name: string | undefined;
  company: string | undefined;
  description: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  website: string | undefined;
}


export const setInfo = functions.https.onCall((data, context) => {
  const uid = context.auth?.uid;
  const info: SetInfoParams = data; // TODO: Validate
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
  return firestore.collection("experts").doc(uid).update({
    info: info,
  });
});
