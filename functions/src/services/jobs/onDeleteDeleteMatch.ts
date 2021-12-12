import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Job} from "../../interfaces/firestore";


const firestore = admin.firestore();


export const onDeleteDeleteMatch = functions.firestore.document("jobs/{jobId}").onDelete(async (snapshot, context) => {
  const job: Job = snapshot.data() as Job;
  const jobId = context.params.jobId;
  if (job.active) {
    await firestore.collection("matches").doc(jobId).delete();
  }
});


