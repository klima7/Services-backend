import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {OfferUpdate} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onDelete = functions.firestore.document("experts/{expertId}").onDelete(async (snapshot, context) => {
  // const expert = snapshot.data() as Expert;
  const expertId = context.params.expertId;

  await deleteRatings(expertId);
  await deleteTokens(expertId);
  await nullifyOffers(expertId);
});


async function deleteRatings(expertId: string) {
  const ratings = await firestore
      .collection("ratings")
      .where("expertId", "==", expertId)
      .get();
  ratings.docs.map(async (doc) => await doc.ref.delete());
}


async function deleteTokens(expertId: string) {
  const ratings = await firestore.collection("experts").doc(expertId).collection("tokens").get();
  ratings.docs.map(async (doc) => await doc.ref.delete());
}


async function nullifyOffers(expertId: string) {
  const offers = await firestore
      .collection("offers")
      .where("expertId", "==", expertId)
      .get();

  const offerUpdate: Partial<OfferUpdate> = {
    expertId: null,
  };

  offers.docs.forEach(async (offerDoc) => {
    await offerDoc.ref.update(offerUpdate);
  });
}
