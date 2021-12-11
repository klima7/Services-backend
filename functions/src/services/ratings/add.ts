import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {ExpertUpdate, MessageUpdate, Offer, Rating} from "../../interfaces/firestore";
import {getRole} from "../../lib/utils";

const firestore = admin.firestore();


abstract class AddParams {
  abstract offerId: string;
  abstract rating: number;
  abstract comment: string | null;
}


const schemaAddParams = Joi.object({
  offerId: Joi.string().required(),
  rating: Joi.number().required().min(0).max(5),
  comment: Joi.string().allow(null).max(500),
});


export const add = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: AddParams = data;
  const validation = schemaAddParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  const offer = (await firestore.collection("offers").doc(params.offerId).get()).data() as Offer;

  if (offer.ratingId != null) {
    throw new functions.https.HttpsError("failed-precondition", "Rating already added");
  }

  if (offer.expertId == null) {
    throw new functions.https.HttpsError("failed-precondition", "Expert no longer exists");
  }

  // Add rating
  const ratingData: Rating = {
    clientName: offer.clientName,
    comment: params.comment,
    date: admin.firestore.FieldValue.serverTimestamp(),
    expertId: offer.expertId,
    rating: params.rating,
    serviceName: offer.serviceName,
  };
  const ratingRef = await firestore.collection("ratings").add(ratingData);

  // Update offerId
  const offerData: Partial<Offer> = {
    ratingId: ratingRef.id,
  };
  await firestore.collection("offers").doc(params.offerId).update(offerData);

  // Update rating score
  const expertData: Partial<ExpertUpdate> = {
    ratingsCount: admin.firestore.FieldValue.increment(1),
    ratingsSum: admin.firestore.FieldValue.increment(params.rating),
  };
  await firestore.collection("experts").doc(offer.expertId).update(expertData);

  // Add message
  const author = getRole(uid, offer);
  if (author == null) {
    throw Error("User not if offer. Should never happen");
  }
  const messageData: MessageUpdate = {
    author: author,
    ratingId: ratingRef.id,
    time: admin.firestore.FieldValue.serverTimestamp(),
    rating: params.rating,
    type: 3,
  };

  await firestore.collection("offers").doc(params.offerId).collection("messages").add(messageData);
});
