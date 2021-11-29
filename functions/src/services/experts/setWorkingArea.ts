import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {geocodingRepository} from "../../utils/geocoding";
import {ExpertUpdate} from "../../interfaces/firestore";

const firestore = admin.firestore();


interface SetWorkingAreaParams {
  placeId: string;
  radius: number;
}

const schemaSetWorkingAreaParams = Joi.object({
  placeId: Joi.string().required().min(1).max(100),
  radius: Joi.number().required().min(0).max(50),
});


export const setWorkingArea = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  // Check whether user have expert account
  const expert = (await firestore.collection("experts").doc(uid).get()).data() as ExpertUpdate;
  if (expert == null) {
    throw new functions.https.HttpsError("failed-precondition", "User does not have expert account");
  }

  const params: SetWorkingAreaParams = data;
  const validation = schemaSetWorkingAreaParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  const geocodingResult = await geocodingRepository.getLocationByPlaceId(params.placeId);

  if (geocodingResult.country != "PL") {
    throw new functions.https.HttpsError("invalid-argument", "Provided location is not in Poland");
  }

  const expertData: Partial<ExpertUpdate> = {
    workingArea: {
      coordinates: new admin.firestore.GeoPoint(geocodingResult.latitude, geocodingResult.longitude),
      locationName: geocodingResult.name,
      locationId: params.placeId,
      radius: params.radius,
    },
  };

  await firestore.collection("experts").doc(uid).update(expertData);
});
