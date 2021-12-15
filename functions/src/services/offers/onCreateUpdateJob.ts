import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {JobUpdate, Offer} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onCreateUpdateJob = functions.firestore.document("offers/{offerId}").onCreate(async (snapshot, context) => {
  const offer = snapshot.data() as Offer;
  const jobId = offer.jobId;

  const offerId = context.params.offerId;
  const jobUpdate: Partial<JobUpdate> = {
    offers: admin.firestore.FieldValue.arrayUnion(offerId),
  };
  firestore.collection("jobs").doc(jobId).update(jobUpdate);
});
