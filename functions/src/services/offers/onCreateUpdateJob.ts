import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {JobUpdate, Offer} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onCreateUpdateJob = functions.firestore.document("offers/{offerId}").onCreate(async (snapshot, context) => {
  const offer = snapshot.data() as Offer;
  const jobId = offer.jobId;

  const jobUpdate: Partial<JobUpdate> = {
    expertsIds: admin.firestore.FieldValue.arrayUnion(offer.expertId),
  };
  firestore.collection("jobs").doc(jobId).update(jobUpdate);
});
