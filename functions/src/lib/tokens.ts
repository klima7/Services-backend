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
