import * as admin from "firebase-admin";


const firestore = admin.firestore();


export async function finishJob(jobId: string): Promise<void> {
  console.log("Finishing job");
  await firestore.collection("jobs").doc(jobId).update({active: false});
}
