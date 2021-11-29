import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Expert} from "../../interfaces/firestore";

const firestore = admin.firestore();


export const createAccount = functions.https.onCall(async (_data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  // Check whether expert already has an account
  const expert = (await firestore.collection("experts").doc(uid).get()).data() as Expert;
  if (expert != null) {
    throw new functions.https.HttpsError("failed-precondition", "User already have expert account");
  }

  const user = await admin.auth().getUser(uid);

  const expertData: Expert = {
    commentsCount: 0,
    rating: 0,
    ratingsCount: 0,
    ratingsSum: 0,
    ready: true,
    info: {
      company: null,
      description: null,
      email: null,
      name: user.displayName || null,
      phone: null,
      website: null,
    },
    profileImage: null,
    workingArea: null,
    services: [],
  };

  return firestore.collection("experts").doc(uid).set(expertData);
});
