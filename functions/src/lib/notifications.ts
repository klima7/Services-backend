import * as admin from "firebase-admin";
import {Client, Expert, Message, Notification, Offer, Token} from "../interfaces/firestore";

const firestore = admin.firestore();
const messaging = admin.messaging();


export async function sendNotificationFromMessage(offerId: string, message: Message): Promise<void> {
  const offer: Offer = (await firestore.collection("offers").doc(offerId).get()).data() as Offer;
  if (offer == null) {
    throw Error("Offer not found");
  }

  const [_senderUid, receiverUid] = getSenderAndReceiverUids(offer, message);
  console.log(_senderUid);
  const senderName = await getSenderName(offer, message);

  if (receiverUid == null) {
    return;
  }

  if (message.type == 0) {
    await sendTextMessageNotification(receiverUid, senderName, offer, message);
  } else if (message.type == 1) {
    await sendImageMessageNotification(receiverUid, senderName, offer, message);
  } else if (message.type == 2) {
    console.log("Status change message");
  } else if (message.type == 3) {
    console.log("Comment added message");
  }
}


function getSenderAndReceiverUids(offer: Offer, message: Message): Array<string | null> {
  if (message.author == "expert") {
    return [offer.expertId, offer.clientId];
  } else {
    return [offer.clientId, offer.expertId];
  }
}


async function getSenderName(offer: Offer, message: Message): Promise<string> {
  if (message.author == "expert") {
    if (offer.expertId == null) {
      return "Unknown";
    }
    const expert: Expert = (await firestore.collection("experts").doc(offer.expertId).get()).data() as Expert;
    return expert.info.name ?? "Unknown";
  } else {
    if (offer.clientId == null) {
      return "Unknown";
    }
    const client: Client = (await firestore.collection("clients").doc(offer.clientId).get()).data() as Client;
    return client.info.name ?? "Unknown";
  }
}


async function sendTextMessageNotification(receiverUid: string, senderName: string,
    _offer: Offer, message: Message): Promise<void> {
  console.log("Sending text notification");
  const notification: Notification = {
    type: "text-message",
    sender: senderName,
    message: message.message ?? "",
  };
  await sendNotificationToUser(receiverUid, notification);
}


async function sendImageMessageNotification(receiverUid: string, senderName: string,
    _offer: Offer, _message: Message): Promise<void> {
  console.log("Sending image notification");
  const notification: Notification = {
    type: "image-message",
    sender: senderName,
  };
  await sendNotificationToUser(receiverUid, notification);
}


async function sendNotificationToUser(uid: string, notification: Notification) {
  const payload: admin.messaging.MessagingPayload = {
    data: notification as admin.messaging.MessagingPayload["data"],
  };

  const tokens: Array<string> = (await firestore.collection("tokens")
      .where("uid", "==", uid).get())
      .docs.map((it)=>(it.data() as Token).token);

  tokens.forEach(async (token) => {
    console.log("SENDING NOTIFICATION TO " + token);
    console.log("SENDING DATA" + notification);
    await messaging.sendToDevice(token, payload);
  });
}
