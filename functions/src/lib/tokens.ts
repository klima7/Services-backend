import * as admin from "firebase-admin";
import {Role} from "../interfaces/domain";
import {Token} from "../interfaces/firestore";


const firestore = admin.firestore();


export async function getTokensForUser(uid: string, role: Role): Promise<Array<string>> {
  let collectionName = null;
  if (role == "expert") {
    collectionName = "experts";
  } else {
    collectionName = "clients";
  }

  const tokens: Array<string> = (await firestore
      .collection(collectionName)
      .doc(uid)
      .collection("tokens")
      .get())
      .docs.map((it)=>(it.data() as Token).token);

  return tokens;
}


export async function deleteToken(uid: string, role: Role, token: string): Promise<void> {
  let collectionName = null;
  if (role == "expert") {
    collectionName = "experts";
  } else {
    collectionName = "clients";
  }

  (await firestore
      .collection(collectionName)
      .doc(uid)
      .collection("tokens")
      .where("token", "==", token)
      .get())
      .forEach(async (doc) => await doc.ref.delete());
}


export async function deleteOutdatedTokens(): Promise<void> {
  const minTime = admin.firestore.Timestamp.fromDate(getMinTime());
  (await firestore
      .collectionGroup("tokens")
      .where("time", "<=", minTime)
      .get())
      .forEach(async (token) => await token.ref.delete());
}


function getMinTime(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
}
