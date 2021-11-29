import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Offer} from "../models";

const firestore = admin.firestore();

interface AddParams {
  offerId: string;
  rating: number;
  comment: string;
}

export const add = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "User is not authenticated");
  }

  const params: AddParams = data;

  const offer = (await firestore.collection("offers").doc(params.offerId).get()).data() as Offer;

  const ratingData = {
    clientName: offer.clientName,
    comment: params.comment,
    date: admin.firestore.FieldValue.serverTimestamp(),
    expertId: offer.expertId,
    offerId: params.offerId,
    rating: params.rating,
    serviceName: offer.serviceName,
  };

  const ratingRef = await firestore.collection("ratings").add(ratingData);

  const offerData = {
    ratingId: ratingRef.id,
  };

  await firestore.collection("offers").doc(params.offerId).update(offerData);
});
