import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();


export const createExpertAccount = functions.https.onCall((data, context) => {
  const expert = {
    active: true,
    commentsCount: 0,
    profileImage: null,
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
