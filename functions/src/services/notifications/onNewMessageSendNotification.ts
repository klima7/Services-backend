import * as functions from "firebase-functions";
import {Message} from "../../interfaces/firestore";
import {sendNotificationFromMessage} from "../../lib/notifications";


export const onNewMessageSendNotification = functions.firestore.document("offers/{offerId}/messages/{messageId}").onCreate(async (snapshot, context) => {
  const message: Message = snapshot.data() as Message;
  const offerId: string = context.params.offerId;
  await sendNotificationFromMessage(offerId, message);
});
