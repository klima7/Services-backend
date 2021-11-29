import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Client} from "../../interfaces/firestore";

const firestore = admin.firestore();


export const createAccount = functions.https.onCall(async (_data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  // Check whether client has an account
  const client = (await firestore.collection("clients").doc(uid).get()).data() as Client;
  if (client != null) {
    throw new functions.https.HttpsError("failed-precondition", "User already have client account");
  }

  const user = await admin.auth().getUser(uid);

  const clientData: Client = {
    info: {
      name: user.displayName || null,
      phone: null,
    },
  };

  return firestore.collection("clients").doc(uid).set(clientData);
});
