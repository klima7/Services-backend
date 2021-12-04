import * as functions from "firebase-functions";
import {finishEndedJobs} from "../../lib/finishEndedJobs";


export const finishEndedOnRequest = functions.https.onRequest(async (_request, response) => {
  await finishEndedJobs();
  response.send("Done");
});
