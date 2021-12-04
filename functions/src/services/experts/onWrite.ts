import * as functions from "firebase-functions";
import {Expert} from "../../interfaces/firestore";


export const onWrite = functions.firestore.document("experts/{expertId}").onWrite(async (snapshot) => {
  const expert: Expert = snapshot.after.data() as Expert;
  if (expert == null) {
    return;
  }

  const newRating = expert.ratingsSum / expert.ratingsCount;
  const ready = isReady(expert);

  const expertData: Partial<Expert> = {
    rating: newRating,
    ready: ready,
  };
  await snapshot.after.ref.update(expertData);
});


function isReady(expert: Expert): boolean {
  return expert.info.name != null && expert.services.length != 0 && expert.workingArea != null;
}
