import * as functions from "firebase-functions";


export const deleteAccount = functions.https.onCall((_data, _context) => {
  console.log("Deleting account");
  // TODO: implement
});
