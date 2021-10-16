import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";
import {SetInfoParams, SetServicesParams, SetWorkingAreaParams} from "./models";
import {geocodingRepository} from "./geocoding";
import {getDownloadUrl} from "./utils";

const firestore = admin.firestore();
const bucket = admin.storage().bucket();


export const createExpertAccount = functions.https.onCall((data, context) => {
  const expert = {
    active: true,
    commentsCount: 0,
    rating: 0,
    ratingsCount: 0,
    ratingsSum: 0,
    ready: true,
    info: {
      company: null,
      description: null,
      email: null,
      name: null,
      phone: null,
      website: null,
    },
    profileImage: null,
    workingArea: null,
    services: [],
  };
  if (context.auth != null) {
    return firestore.collection("experts").doc(context.auth.uid).set(expert);
  } else {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
});


export const setInfo = functions.https.onCall((data, context) => {
  const uid = context.auth?.uid;
  const info: SetInfoParams = data; // TODO: Validate
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
  return firestore.collection("experts").doc(uid).update({
    info: info,
  });
});


export const setServices = functions.https.onCall((data, context) => {
  const uid = context.auth?.uid;
  const params: SetServicesParams = data; // TODO: Validate
  if (uid == undefined) {
    throw new functions.https.HttpsError("internal", "Users is not authenticated");
  }
  return firestore.collection("experts").doc(uid).update({
    services: params.services,
  });
});


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
      radius: params.radius,
    },
  });

  console.log("Working area in firestore updated");
});


exports.onProfileImageUploaded = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  if (filePath == undefined) {
    throw new functions.https.HttpsError("internal", "No file path");
  }

  if (!filePath.startsWith("profile_images/")) {
    return;
  }

  const uid = path.parse(filePath).name;

  const data = {
    profileImage: {
      url: await getDownloadUrl(bucket.file(filePath)),
      changeTime: admin.firestore.FieldValue.serverTimestamp(),
    },
  };

  await firestore.collection("experts").doc(uid).update(data);
});


