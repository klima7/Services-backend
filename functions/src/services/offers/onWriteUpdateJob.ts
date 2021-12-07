import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {JobUpdate, Offer} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onWriteUpdateJob = functions.firestore.document("offers/{offerId}").onWrite(async (snapshot, context) => {
  const offerId = context.params.offerId;
  const before = snapshot.before.data() as Offer | undefined;
  const after = snapshot.after.data() as Offer | undefined;
  const jobId = after?.jobId ?? before?.jobId;

  if (jobId == null) {
    throw Error("Unknown job id");
  }

  const jobUpdate: Partial<JobUpdate> = {
    unreadOffers: getValueToUpdateUnreadOffers(offerId, after),
  };

  await firestore.collection("jobs").doc(jobId).update(jobUpdate);
});


function getValueToUpdateUnreadOffers(
    offerId: string,
    offerAfter: Offer | undefined
): admin.firestore.FieldValue {
  if (offerAfter == undefined) { // Offer was removed
    return admin.firestore.FieldValue.arrayRemove(offerId);
  } else if (offerAfter.clientReadTime == null) { // Offer was never opened
    return admin.firestore.FieldValue.arrayUnion(offerId);
  } else if (offerAfter.lastMessage == null) { // Offers was opened but no messages
    return admin.firestore.FieldValue.arrayRemove(offerId);
  } else if (offerAfter.lastMessage?.author == "client") { // Last message was sent by client
    return admin.firestore.FieldValue.arrayRemove(offerId);
  } else if (offerAfter.clientReadTime.toDate() < offerAfter.lastMessage.time.toDate()) { // Some unread messages
    return admin.firestore.FieldValue.arrayUnion(offerId);
  } else { // No unread messages
    return admin.firestore.FieldValue.arrayRemove(offerId);
  }
}
