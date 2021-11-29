import * as functions from "firebase-functions";
import {Expert} from "../../interfaces/firestore";


export const onUpdateSetRating = functions.firestore.document("experts/{expertId}").onUpdate(async (change) => {
  const expert: Expert = change.after.data() as Expert;

  const expertData: Partial<Expert> = {
    rating: expert.ratingsSum / expert.ratingsCount,
  };

  await change.after.ref.update(expertData);
});
