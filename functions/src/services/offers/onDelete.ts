import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {JobUpdate, Offer} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onDelete = functions.firestore.document("offers/{offerId}").onDelete(async (snapshot, context) => {
  const offer = snapshot.data() as Offer;
  const offerId = context.params.offerId;
  const jobId = offer.jobId;

  // Update job
  const jobUpdate: Partial<JobUpdate> = {
    offers: admin.firestore.FieldValue.arrayRemove(offerId),
    unreadOffers: admin.firestore.FieldValue.arrayRemove(offerId),
  };
  firestore.collection("jobs").doc(jobId).update(jobUpdate);

  // Delete messages
  await deleteMessages(offerId);
});


async function deleteMessages(offerId: string) {
  const messages = firestore.collection("offers").doc(offerId).collection("messages").get();
  (await messages).forEach(async (messageDoc) => {
    await messageDoc.ref.delete();
  });
}

