import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {geocodingRepository} from "../../utils/geocoding";

const firestore = admin.firestore();

interface SetWorkingAreaParams {
  placeId: string;
  radius: number;
}

export const setWorkingArea = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const params: SetWorkingAreaParams = data; // TODO: Validate
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
  console.log(`expert-setWorkingArea(${params.placeId}, ${params.radius})`);

  const gcResult = await geocodingRepository.getLocationByPlaceId(params.placeId);
  console.log("Geocoded location: " + JSON.stringify(gcResult));

  if (gcResult.country != "PL") {
    throw new functions.https.HttpsError("internal", "Provided location is not in Poland");
  }

  await firestore.collection("experts").doc(uid).update({
    workingArea: {
      coordinates: new admin.firestore.GeoPoint(gcResult.latitude, gcResult.longitude),
      locationName: gcResult.name,
      locationId: params.placeId,
      radius: params.radius,
    },
  });

  console.log("Working area in firestore updated");
});
