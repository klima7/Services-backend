import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {OfferUpdate} from "../../interfaces/firestore";
import {finishJob} from "../../lib/finishJob";


const firestore = admin.firestore();


export const onDelete = functions.firestore.document("clients/{clientId}").onDelete(async (_snapshot, context) => {
  const clientId = context.params.clientId;

  await deleteTokens(clientId);
  await finishJobs(clientId);
  await nullifyJobs(clientId);
  await nullifyOffers(clientId);
});


async function deleteTokens(clientId: string) {
  const ratings = await firestore.collection("clients").doc(clientId).collection("tokens").get();
  ratings.docs.map(async (doc) => await doc.ref.delete());
}


async function nullifyJobs(clientId: string) {
  const jobs = await firestore
      .collection("jobs")
      .where("clientId", "==", clientId)
      .get();

  const offerUpdate: Partial<OfferUpdate> = {
    clientId: null,
  };

  jobs.docs.forEach(async (offerDoc) => {
    await offerDoc.ref.update(offerUpdate);
  });
}


async function nullifyOffers(clientId: string) {
  const offers = await firestore
      .collection("offers")
      .where("clientId", "==", clientId)
      .get();

  const offerUpdate: Partial<OfferUpdate> = {
    clientId: null,
  };

  offers.docs.forEach(async (offerDoc) => {
    await offerDoc.ref.update(offerUpdate);
  });
}


async function finishJobs(clientId: string) {
  const jobsIds = (await firestore
      .collection("jobs")
      .where("clientId", "==", clientId)
      .get())
      .docs.map((doc) => doc.id);

  jobsIds.forEach(async (jobId) => finishJob(jobId));
}
