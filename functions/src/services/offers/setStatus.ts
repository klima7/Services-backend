import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {MessageUpdate, Offer} from "../../interfaces/firestore";
import {getRole} from "../../lib/utils";

const firestore = admin.firestore();


export interface SetStatusParams {
  offerId: string;
  status: number;
}


const schemaSetStatusParams = Joi.object({
  offerId: Joi.string().required().max(100),
  status: Joi.number().required().allow(0, 1, 2, 3),
});


export const setStatus = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: SetStatusParams = data;
  const validation = schemaSetStatusParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  // Verify wheter caller is offer client of expert
  const offer = (await firestore.collection("offers").doc(params.offerId).get()).data() as Offer;
  if (uid != offer.clientId && uid != offer.expertId) {
    throw new functions.https.HttpsError("invalid-argument", "Requested offer does not belong to requesting user");
  }

  // Update status
  const offerData: Partial<Offer> = {
    status: params.status,
  };
  await firestore.collection("offers").doc(params.offerId).update(offerData);

  // Add message
  const author = getRole(uid, offer);
  if (author == null) {
    throw Error("User not if offer. Should never happen");
  }
  const messageData: MessageUpdate = {
    author: author,
    newStatus: params.status,
    time: admin.firestore.FieldValue.serverTimestamp(),
    type: 2,
  };

  await firestore.collection("offers").doc(params.offerId).collection("messages").add(messageData);
});
