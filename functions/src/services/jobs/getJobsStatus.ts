import * as functions from "firebase-functions";

export const getJobStatus = functions.https.onCall(async (_data, _context) => {
  // 0 - new
  // 1 - rejected
  // 2 - accepted
  return {
    status: 1,
  };
});
