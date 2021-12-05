import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {Match} from "../../interfaces/firestore";


const firestore = admin.firestore();


interface GetJobStatusParams {
  jobId: string;
}


const schemaGetJobStatusParams = Joi.object({
  jobId: Joi.string().required(),
});


// 0 - new, 1 - rejected, 2 - accepted
export const getJobStatus = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: GetJobStatusParams = data;
  const validation = schemaGetJobStatusParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  const jobId = params.jobId;

  // Get offers
  const offers = (await firestore.collection("offers")
      .where("jobId", "==", jobId)
      .where("expertId", "==", uid)
      .select()
      .get())
      .docs.map((it)=>it.id);
  if (offers.length > 0) {
    return 2; // Accepted
  }

  // Get match
  const match: Match = (await firestore.collection("matches").doc(jobId).get()).data() as Match;
  if (match == null) {
    throw new functions.https.HttpsError("not-found", "Job not found");
  }

  if (match.new.includes(uid)) {
    return 0; // New
  } else if (match.rejected.includes(uid)) {
    return 1; // Rejected
  } else {
    throw new functions.https.HttpsError("permission-denied", "No permission for this job");
  }
});
