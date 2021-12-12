import * as functions from "firebase-functions";
import {Offer} from "../../interfaces/firestore";
import {sendReadNotification} from "../../lib/notifications";


export const onOfferReadSendNotification = functions.firestore.document("offers/{offerId}").onUpdate(async (snapshot, context) => {
  const offerId = context.params.offerId;
  const before = snapshot.before.data() as Offer;
  const after = snapshot.after.data() as Offer;

  if (before.clientReadTime?.toMillis() !== after.clientReadTime?.toMillis() && after?.clientId !== null) {
    sendReadNotification(after.clientId, "client", offerId);
  } else if (before.expertReadTime?.toMillis() !== after.expertReadTime?.toMillis() && after?.expertId !== null) {
    sendReadNotification(after.expertId, "expert", offerId);
  }
});
