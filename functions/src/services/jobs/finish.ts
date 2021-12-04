import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {Job} from "../../interfaces/firestore";
import {finishJob} from "../../lib/finishJob";

const firestore = admin.firestore();


interface FinishParams {
  jobId: string;
}


const schemaFinish = Joi.object({
  jobId: Joi.string().required(),
});


export const finish = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: FinishParams = data;
  const validation = schemaFinish.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  const jobId = params.jobId;

  const job: Job = (await firestore.collection("jobs").doc(jobId).get()).data() as Job;

  if (job == null) {
    throw new functions.https.HttpsError("not-found", "Job not found");
  }

  if (job.clientId != uid) {
    throw new functions.https.HttpsError("permission-denied", "No permission to finish job");
  }

  await finishJob(jobId);
});
