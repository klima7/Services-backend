import * as functions from "firebase-functions";
import {Job} from "../../interfaces/firestore";


export const onUpdateDelete = functions.firestore.document("jobs/{jobId}").onUpdate(async (snapshot, _context) => {
  const after = snapshot.after.data() as Job;

  if (after.clientId == null && after.offers.length == 0) {
    await snapshot.after.ref.delete();
  }
});
