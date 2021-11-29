import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();

interface SetServicesParams {
  services: Array<string>;
}

export const setServices = functions.https.onCall((data, context) => {
  const uid = context.auth?.uid;
  const params: SetServicesParams = data; // TODO: Validate
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
  return firestore.collection("experts").doc(uid).update({
    services: params.services,
  });
});
