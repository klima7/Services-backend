import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {ExpertInfo} from "./models";

const firestore = admin.firestore();


export const createExpertAccount = functions.https.onCall((data, context) => {
  const expert = {
    active: true,
    commentsCount: 0,
    rating: 0,
    ratingsCount: 0,
    ratingsSum: 0,
    ready: true,
    info: {
      company: null,
      description: null,
      email: null,
      name: null,
      phone: null,
      website: null,
    },
    workingArea: null,
    services: [],
  };
  if (context.auth != null) {
    return firestore.collection("experts").doc(context.auth.uid).set(expert);
  } else {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
});


export const setInfo = functions.https.onCall((data, context) => {
  const uid = context.auth?.uid;
  const info: ExpertInfo = data; // TODO: Validate
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
  return firestore.collection("experts").doc(uid).update({
    info: info,
  });
});

