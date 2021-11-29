import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {Expert, Offer} from "../../interfaces/firestore";

const firestore = admin.firestore();


export interface SetArchivedParams {
  offerId: string;
  archived: boolean;
}


const schemaSetArchivedParams = Joi.object({
  offerId: Joi.string().required().max(100),
  archived: Joi.bool().required(),
});


export const setArchived = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: SetArchivedParams = data;
  const validation = schemaSetArchivedParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  // Check whether user has an expert account
  const expert = (await firestore.collection("experts").doc(uid).get()).data() as Expert;
  if (expert == null) {
    throw new functions.https.HttpsError("failed-precondition", "User does not have expert account");
  }

  // Check whether expert owns offer
  const offer = (await firestore.collection("offers").doc(params.offerId).get()).data() as Offer;
  if (offer == null || offer.expertId != uid) {
    throw new functions.https.HttpsError("failed-precondition", "Provided offer does not belong to this user");
  }

  const offerData: Partial<Offer> = {
    archived: params.archived,
  };

  await firestore.collection("offers").doc(params.offerId).update(offerData);
});
