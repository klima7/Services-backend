import * as functions from "firebase-functions";

export const reject = functions.https.onCall(async (_data, _context) => {
  console.log("Rejecting job");
});
