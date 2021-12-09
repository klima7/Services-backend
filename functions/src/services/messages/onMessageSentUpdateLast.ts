import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Message, OfferUpdate} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onMessageSentUpdateLast = functions.firestore.document("offers/{offerId}/messages/{messageId}").onCreate(async (snapshot, context) => {
  const message: Message = snapshot.data() as Message;
  const offerId: string = context.params.offerId;

  const offerUpdate: Partial<OfferUpdate> = {
    lastMessage: message,
  };

  await firestore.collection("offers").doc(offerId).update(offerUpdate);
});
