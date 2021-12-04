import * as admin from "firebase-admin";
import {finishJob} from "./finishJob";


const firestore = admin.firestore();


export async function finishEndedJobs(): Promise<void> {
  const currentTime = admin.firestore.Timestamp.now();
  const endedJobsIds = (await firestore.collection("jobs")
      .where("finishDate", "<=", currentTime)
      .where("active", "==", true)
      .select()
      .get())
      .docs.map((it)=>it.id);

  console.log(`Number of jobs to finish: ${endedJobsIds.length}`);

  endedJobsIds.forEach((jobId) => finishJob(jobId));
}
