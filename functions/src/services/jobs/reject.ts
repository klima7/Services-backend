import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {Match, MatchUpdate} from "../../interfaces/firestore";


const firestore = admin.firestore();


interface RejectParams {
  id: string;
}


const schemaRejectParams = Joi.object({
  id: Joi.string().required(),
});


export const reject = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: RejectParams = data;
  const validation = schemaRejectParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  const jobId = params.id;

  // check whether actually job is new
  const match: Match = (await firestore.collection("matches").doc(jobId).get()).data() as Match;

  if (match == null) {
    throw new functions.https.HttpsError("not-found", "Job not found");
  }

  if (!match.new.includes(uid)) {
    throw new functions.https.HttpsError("failed-precondition", "Job is not new");
  }

  const matchUpdate: Partial<MatchUpdate> = {
    new: admin.firestore.FieldValue.arrayRemove(uid),
    rejected: admin.firestore.FieldValue.arrayUnion(uid),
  };

  await firestore.collection("matches").doc(jobId).update(matchUpdate);
});
