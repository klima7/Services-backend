import * as admin from "firebase-admin";
import {JobUpdate} from "../interfaces/firestore";


const firestore = admin.firestore();


export async function finishJob(jobId: string): Promise<void> {
  const jobUpdate: Partial<JobUpdate> = {
    active: false,
  };

  await firestore.collection("jobs").doc(jobId).update(jobUpdate);

  await firestore.collection("matches").doc(jobId).delete();
}
