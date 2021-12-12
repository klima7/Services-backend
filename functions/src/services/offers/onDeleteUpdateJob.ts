import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {JobUpdate, Offer} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onDeleteUpdateJob = functions.firestore.document("offers/{offerId}").onDelete(async (snapshot, context) => {
  const offer = snapshot.data() as Offer;
  const jobId = offer.jobId;

  const offerId = context.params.offerId;
  const jobUpdate: Partial<JobUpdate> = {
    offers: admin.firestore.FieldValue.arrayRemove(offerId),
    unreadOffers: admin.firestore.FieldValue.arrayRemove(offerId),
  };
  firestore.collection("jobs").doc(jobId).update(jobUpdate);
});
