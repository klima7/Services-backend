import * as admin from "firebase-admin";
import {Role} from "../interfaces/domain";
import {Client, Expert, Message, Offer} from "../interfaces/firestore";
import {Notification} from "../interfaces/messaging";
import {getTokensForUser} from "./tokens";

const firestore = admin.firestore();
const messaging = admin.messaging();


export async function sendNotificationFromMessage(offerId: string, message: Message): Promise<void> {
  const offer: Offer = (await firestore.collection("offers").doc(offerId).get()).data() as Offer;
  if (offer == null) {
    throw Error("Offer not found");
  }

  const [receiverUid, receiverRole] = getReceiver(offer, message);
  const senderName = await getSenderName(offer, message);

  if (receiverUid == null) {
    return;
  }

  if (message.type == 0) {
    await sendTextMessageNotification(receiverUid, receiverRole, senderName, offerId, offer, message);
  } else if (message.type == 1) {
    await sendImageMessageNotification(receiverUid, receiverRole, senderName, offerId, offer, message);
  } else if (message.type == 2) {
    sendOfferStatusChangeNotification(receiverUid, receiverRole, senderName, offerId, offer, message);
  } else if (message.type == 3) {
    sendRatingAddedNotification(receiverUid, receiverRole, senderName, offerId, offer, message);
  }
}


function getReceiver(offer: Offer, message: Message): [string|null, Role] {
  if (message.author == "expert") {
    return [offer.clientId, "client"];
  } else {
    return [offer.expertId, "expert"];
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


async function sendTextMessageNotification(receiverUid: string, receiverRole: Role, senderName: string,
    offerId: string, _offer: Offer, message: Message): Promise<void> {
  console.log("Sending text notification");
  const notification: Notification = {
    type: "text-message",
    sender: senderName,
    message: message.message ?? "",
    offerId: offerId,
  };
  await sendNotificationToUser(receiverUid, receiverRole, notification);
}


async function sendImageMessageNotification(receiverUid: string, receiverRole: Role, senderName: string,
    offerId: string, _offer: Offer, _message: Message): Promise<void> {
  console.log("Sending image notification");
  const notification: Notification = {
    type: "image-message",
    sender: senderName,
    offerId: offerId,
  };
  await sendNotificationToUser(receiverUid, receiverRole, notification);
}


async function sendOfferStatusChangeNotification(receiverUid: string, receiverRole: Role, senderName: string,
    offerId: string, _offer: Offer, message: Message): Promise<void> {
  console.log("Sending status change notification");
  const notification: Notification = {
    type: "status-change",
    sender: senderName,
    offerId: offerId,
    newStatus: message.newStatus?.toString() ?? "0",
  };
  await sendNotificationToUser(receiverUid, receiverRole, notification);
}


async function sendRatingAddedNotification(receiverUid: string, receiverRole: Role, senderName: string,
    offerId: string, _offer: Offer, message: Message): Promise<void> {
  console.log("Sending rating added notification");
  const notification: Notification = {
    type: "rating-added",
    sender: senderName,
    offerId: offerId,
    ratingId: message.ratingId ?? "0",
    rating: message.rating?.toString() ?? "0.0",
  };
  await sendNotificationToUser(receiverUid, receiverRole, notification);
}


export async function sendReadNotification(receiverUid: string, receiverRole: Role, offerId: string): Promise<void> {
  console.log("Sending read notification");
  const notification: Notification = {
    type: "offer-read",
    offerId: offerId,
  };
  await sendNotificationToUser(receiverUid, receiverRole, notification);
}


async function sendNotificationToUser(uid: string, role: Role, notification: Notification) {
  notification.uid = uid;
  const payload: admin.messaging.MessagingPayload = {
    data: notification as admin.messaging.MessagingPayload["data"],
  };

  const tokens = await getTokensForUser(uid, role);
  tokens.forEach(async (token) => {
    try {
      await messaging.sendToDevice(token, payload);
    } catch (e) {
      console.log("Send notification failure");
    }
  });
}
