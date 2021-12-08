import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import {finishEndedJobs} from "../../lib/finishEndedJobs";
import {Token} from "../../interfaces/firestore";


const firestore = admin.firestore();
const messaging = admin.messaging();


export const finishEndedOnRequest = functions.https.onRequest(async (_request, response) => {
  // await finishEndedJobs();
  await test("pnmE94NiTQbRV3tuUWYf0Pj3XHq1");
  response.send("Done");
});


async function test(uid: string) {
  const tokens: Array<string> = (await firestore.collection("tokens")
      .where("uid", "==", uid).get())
      .docs.map((it)=>(it.data() as Token).token);
  console.log("Tokens get: " + tokens);
  tokens.forEach(async (token) => {
    await sendNotification(token);
  });
}

async function sendNotification(token: string) {
  console.log("Sending notification to: " + token);
  const payload: admin.messaging.MessagingPayload = {
    data: {
      type: "message",
      sender: "Mateusz Ziemiański",
      message: "Cześć, jak tam? Jak idzie? Czy praca została już wykonana?",
    },
  };
  await messaging.sendToDevice(token, payload);
  console.log("Notification sent");
}
