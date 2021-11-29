import * as functions from "firebase-functions";


export const create = functions.https.onCall(async (_data, _context) => {
  console.log("Creating job");
  await new Promise((f) => setTimeout(f, 500));
});
