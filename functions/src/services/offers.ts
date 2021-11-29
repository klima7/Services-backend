import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firestore = admin.firestore();

export interface SetOfferArchivedParams {
  offerId: string;
  archived: boolean;
}

export const setOfferArchived = functions.https.onCall(async (_data, _context) => {
  const params: SetOfferArchivedParams = _data;
  console.log("Accepting job");
  await firestore.collection("offers").doc(params.offerId).update({
    archived: params.archived,
  });
});
