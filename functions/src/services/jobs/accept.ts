import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {Job, Match, MatchUpdate, OfferUpdate, Expert} from "../../interfaces/firestore";
import {MAX_EXPERTS_PER_JOB} from "../../lib/constants";
import {finishJob} from "../../lib/finishJob";
import {sendNewOfferNotification} from "../../lib/notifications";


const firestore = admin.firestore();


interface AcceptParams {
  id: string;
}


const schemaAcceptParams = Joi.object({
  id: Joi.string().required(),
});


export const accept = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: AcceptParams = data;
  const validation = schemaAcceptParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  const jobId = params.id;

  // Ensure that job is new or rejected
  const match: Match = (await firestore.collection("matches").doc(jobId).get()).data() as Match;

  if (match == null) {
    throw new functions.https.HttpsError("not-found", "Job not found");
  }

  if (!match.new.includes(uid) && !match.rejected.includes(uid)) {
    throw new functions.https.HttpsError("failed-precondition", "Job is neither new nor rejected");
  }

  // Get job
  const job: Job = (await firestore.collection("jobs").doc(jobId).get()).data() as Job;
  if (job == null) {
    throw new functions.https.HttpsError("not-found", "Job not found");
  }

  // Get expert
  const expert: Expert = (await firestore.collection("experts").doc(uid).get()).data() as Expert;
  if (expert == null) {
    throw new functions.https.HttpsError("not-found", "Expert not found");
  }
  if (expert.ready == false) {
    throw new functions.https.HttpsError("failed-precondition", "Expert is not ready");
  }

  // Update match
  const matchUpdate: Partial<MatchUpdate> = {
    new: admin.firestore.FieldValue.arrayRemove(uid),
    rejected: admin.firestore.FieldValue.arrayRemove(uid),
  };

  await firestore.collection("matches").doc(jobId).update(matchUpdate);

  // Create offer
  const offer: OfferUpdate = {
    jobId: jobId,
    ratingId: null,
    creationTime: admin.firestore.FieldValue.serverTimestamp(),
    status: 0,
    archived: false,
    serviceId: job.serviceId,
    serviceName: job.serviceName,
    clientId: job.clientId,
    clientName: job.clientName,
    clientReadTime: null,
    expertId: uid,
    expertName: expert.info.name ?? "Unknown",
    expertReadTime: null,
    lastMessage: null,
  };

  const addResult = await firestore.collection("offers").add(offer);

  // Check if job is full
  if (await isJobFull(jobId)) {
    finishJob(jobId);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  sendNewOfferNotification(offer.clientId!, offer.expertName, addResult.id, offer.serviceName);

  console.log("Job accepted: " + jobId);
});


async function isJobFull(jobId: string): Promise<boolean> {
  const offersIds = (await firestore.collection("offers")
      .where("jobId", "==", jobId)
      .select()
      .get())
      .docs.map((it)=>it.id);

  return offersIds.length >= MAX_EXPERTS_PER_JOB;
}
