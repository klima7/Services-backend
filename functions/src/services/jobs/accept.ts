import * as functions from "firebase-functions";


export const accept = functions.https.onCall(async (_data, _context) => {
  console.log("Accepting job");
});
