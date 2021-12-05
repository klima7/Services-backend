import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as geofirestore from "geofirestore";
import * as Joi from "joi";
import {geocodingRepository} from "../../utils/geocoding";
import {ExpertUpdate} from "../../interfaces/firestore";
import {MAX_WORKING_AREA_RADIUS} from "../../lib/constants";

const firestore = admin.firestore();
const GeoFirestore = geofirestore.initializeApp(firestore);


interface SetWorkingAreaParams {
  placeId: string;
  radius: number;
}

const schemaSetWorkingAreaParams = Joi.object({
  placeId: Joi.string().required().min(1).max(100),
  radius: Joi.number().required().min(0).max(MAX_WORKING_AREA_RADIUS),
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

  // Update standard information
  const expertData: Partial<ExpertUpdate> = {
    workingArea: {
      coordinates: new admin.firestore.GeoPoint(geocodingResult.latitude, geocodingResult.longitude),
      locationName: geocodingResult.name,
      locationId: params.placeId,
      radius: params.radius,
    },
  };

  const expertsCollection = GeoFirestore.collection("experts", "workingArea.coordinates");
  await expertsCollection.doc(uid).update(expertData, "workingArea.coordinates");
});
