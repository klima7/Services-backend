import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Client} from "../interfaces/firestore";

const firestore = admin.firestore();


export const createAccount = functions.https.onCall(async (_data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const user = await admin.auth().getUser(uid);

  const client: Client = {
    info: {
      name: user.displayName || null,
      phone: null,
    },
  };

  return firestore.collection("clients").doc(uid).set(client);
});


export const deleteAccount = functions.https.onCall((_data, _context) => {
  console.log("Deleting account");
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
