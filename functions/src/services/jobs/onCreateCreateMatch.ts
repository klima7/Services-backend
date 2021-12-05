import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Job, MatchUpdate} from "../../interfaces/firestore";
import {getMatchingExperts} from "../../lib/getMatchingExperts";


const firestore = admin.firestore();


export const onCreateCreateMatch = functions.firestore.document("jobs/{jobId}").onCreate(async (snapshot) => {
  const job: Job = snapshot.data() as Job;

  const matchingExperts = await getMatchingExperts(job);

  const newMatch: MatchUpdate = {
    new: matchingExperts,
    rejected: [],
    creationDate: job.creation,
  };

  await firestore.collection("matches").doc(snapshot.id).set(newMatch);
});


