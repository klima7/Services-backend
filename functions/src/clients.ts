import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();


export const createClientAccount = functions.https.onCall((data, context) => {
  const expert = {
    info: {
      name: null,
      phone: null,
    },
  };
  if (context.auth != null) {
    return firestore.collection("clients").doc(context.auth.uid).set(expert);
  } else {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
});

export interface SetClientInfoParams {
  name: string | undefined;
  phone: string | undefined;
}

export const setInfo = functions.https.onCall((data, context) => {
  const uid = context.auth?.uid;
  const info: SetClientInfoParams = data; // TODO: Validate
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
  return firestore.collection("clients").doc(uid).update({
    info: info,
  });
});
