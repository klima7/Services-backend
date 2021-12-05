import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {geocodingRepository} from "../../utils/geocoding";
import {Client, JobLocation, JobUpdate, Service} from "../../interfaces/firestore";


const firestore = admin.firestore();


interface CreateParams {
  serviceId: string;
  placeId: string;
  description: string;
  realizationTime: string;
}


const schemaCreateParams = Joi.object({
  serviceId: Joi.string().required(),
  placeId: Joi.string().required(),
  description: Joi.string().required(),
  realizationTime: Joi.string().required(),
});


export const create = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: CreateParams = data;
  const validation = schemaCreateParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  // Get client
  const client: Client = (await firestore.collection("clients").doc(uid).get()).data() as Client;
  if (client == null) {
    throw new functions.https.HttpsError("not-found", "Client not found");
  }

  // Get service
  const service: Service = (await firestore.collection("services").doc(params.serviceId).get()).data() as Service;
  if (service == null) {
    throw new functions.https.HttpsError("not-found", "Service not found");
  }

  const finishDate = admin.firestore.Timestamp.fromDate(getFinishDate());

  const geocodingResult = await geocodingRepository.getLocationByPlaceId(params.placeId);

  const location: JobLocation = {
    locationId: params.placeId,
    locationName: geocodingResult.name,
    coordinates: new admin.firestore.GeoPoint(geocodingResult.latitude, geocodingResult.longitude),
  };

  const newJob: JobUpdate = {
    active: true,
    finishDate: finishDate,
    clientId: uid,
    clientName: client.info.name ?? "Unknown",
    creation: admin.firestore.FieldValue.serverTimestamp(),
    description: params.description,
    location: location,
    realizationTime: params.realizationTime,
    serviceId: params.serviceId,
    serviceName: service.name,
  };

  await firestore.collection("jobs").add(newJob);
});


function getFinishDate(): Date {
  const current = new Date();
  const finish = getDateWithoutTime(addDays(current, 7));
  return finish;
}

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date.valueOf());
  newDate.setDate(date.getDate() + days);
  return newDate;
}

function getDateWithoutTime(date: Date): Date {
  return new Date(date.toDateString());
}
