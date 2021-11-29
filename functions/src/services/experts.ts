import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";
import {geocodingRepository} from "../utils/geocoding";
import {getDownloadUrl} from "../utils/firestore";
import {Expert} from "../interfaces/firestore";

const firestore = admin.firestore();
const bucket = admin.storage().bucket();


export const createAccount = functions.https.onCall(async (_data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  // Check whether expert has an account
  const expert = (await firestore.collection("experts").doc(uid).get()).data() as Expert;
  if (expert != null) {
    throw new functions.https.HttpsError("failed-precondition", "User already have expert account");
  }

  const user = await admin.auth().getUser(uid);

  const expertData: Expert = {
    commentsCount: 0,
    rating: 0,
    ratingsCount: 0,
    ratingsSum: 0,
    ready: true,
    info: {
      company: null,
      description: null,
      email: null,
      name: user.displayName || null,
      phone: null,
      website: null,
    },
    profileImage: null,
    workingArea: null,
    services: [],
  };

  return firestore.collection("experts").doc(uid).set(expertData);
});


export const deleteAccount = functions.https.onCall((_data, _context) => {
  console.log("Deleting account");
  // TODO: implement
});


interface SetInfoParams {
  name: string | undefined;
  company: string | undefined;
  description: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  website: string | undefined;
}

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

interface SetServicesParams {
  services: Array<string>;
}

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

exports.onProfileImageDeleted = functions.storage.object().onDelete(async (object) => {
  const filePath = object.name;
  if (filePath == undefined) {
    throw new functions.https.HttpsError("internal", "No file path");
  }

  if (!filePath.startsWith("profile_images/")) {
    return;
  }

  const uid = path.parse(filePath).name;

  const data = {
    profileImage: null,
  };

  await firestore.collection("experts").doc(uid).update(data);
});


export const onUpdateSetRating = functions.firestore.document("experts/{expertId}").onUpdate(async (change) => {
  const expert: Expert = change.after.data() as Expert;

  const expertData: Partial<Expert> = {
    rating: expert.ratingsSum / expert.ratingsCount,
  };

  await change.after.ref.update(expertData);
});

