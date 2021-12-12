import * as functions from "firebase-functions";
import {Expert} from "../../interfaces/firestore";


export const onWrite = functions.firestore.document("experts/{expertId}").onUpdate(async (snapshot) => {
  const expert: Expert = snapshot.after.data() as Expert;

  const newRating = expert.ratingsCount != 0 ? expert.ratingsSum / expert.ratingsCount : 0;
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
