import * as functions from "firebase-functions";
import {finishEndedJobs} from "../../lib/finishEndedJobs";


export const finishEndedAtMidnight = functions.pubsub.schedule("0 0 * * *")
    .timeZone("Europe/Warsaw")
    .onRun((_context) => {
      finishEndedJobs();
    });
