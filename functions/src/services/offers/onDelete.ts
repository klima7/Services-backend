import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {JobUpdate, Offer} from "../../interfaces/firestore";


const firestore = admin.firestore();
const bucket = admin.storage().bucket();


export const onDelete = functions.firestore.document("offers/{offerId}").onDelete(async (snapshot, context) => {
  const offer = snapshot.data() as Offer;
  const offerId = context.params.offerId;

  await updateJob(offerId, offer);
  await deleteImages(offerId);
  await deleteMessages(offerId);
});


async function updateJob(offerId: string, offer: Offer) {
  const jobUpdate: Partial<JobUpdate> = {
    expertsIds: admin.firestore.FieldValue.arrayRemove(offer.expertId),
    unreadOffers: admin.firestore.FieldValue.arrayRemove(offerId),
  };
  firestore.collection("jobs").doc(offer.jobId).update(jobUpdate);
}


async function deleteMessages(offerId: string) {
  const messages = firestore.collection("offers").doc(offerId).collection("messages").get();
  (await messages).forEach(async (messageDoc) => await messageDoc.ref.delete());
}


async function deleteImages(offerId: string) {
  const path = `chats_images/${offerId}`;
  await bucket.deleteFiles({
    prefix: path,
  });
}
