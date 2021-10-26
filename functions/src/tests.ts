import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as geofirestore from "geofirestore";
import {Client} from "@googlemaps/google-maps-services-js";
import {SecretManagerServiceClient} from "@google-cloud/secret-manager";
import {Secret, secretsRepository} from "./secrets";


const firestore = admin.firestore();
const GeoFirestore = geofirestore.initializeApp(firestore);
const gmClient = new Client();
const client = new SecretManagerServiceClient();

export const testGeocoding = functions.https.onRequest(async (request, response) => {
  return gmClient.geocode({
    params: {
      language: "PL",
      place_id: "ChIJAZ-GmmbMHkcR_NPqiCq-8HI",
      key: await secretsRepository.getSecret(Secret.geocodingApiKey),
    },
  }).then((r) => {
    response.send(r.data.results);
  }, (f) => {
    response.send(f);
  });
});


export const testGeo = functions.https.onRequest((request, response) => {
  const geocollection = GeoFirestore.collection("restaurants");
  geocollection.add({
    name: "Geofirestore",
    score: 100,
    // The coordinates field must be a GeoPoint!
    coordinates: new admin.firestore.GeoPoint(40.7589, -73.9851),
  });

  let query = geocollection.near({center: new admin.firestore.GeoPoint(40.7589, -73.9851), radius: 1000});
  query = query.where("value", "==", "1");

  return query.get().then((value) => {
    // All GeoDocument returned by GeoQuery, like the GeoDocument added above
    console.log(value.docs);
    response.send(value.docs);
  });
});


export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


export const getApiKey = functions.https.onRequest((request, response) => {
  console.log(functions.config());
  console.log(functions.config().geocoding);
  response.send("Key: " + functions.config().geocoding.api);
});


export const getApiKey2 = functions.https.onRequest(async (request, response) => {
  return accessSecretVersion().then((success) => {
    response.send("Success: " + success);
  }, (failure) => {
    response.send("Failure: " + failure);
  });
});


async function accessSecretVersion(): Promise<string> {
  console.log("Before");
  const [version] = await client.accessSecretVersion({
    name: "projects/518080781538/secrets/Google-geocoding-key/versions/latest",
  });
  console.log("After");

  const payload = version.payload?.data?.toString();
  console.log(`Payload: ${payload}`);
  return (payload == undefined) ? "Undefined" : payload;
}


export const testSelect = functions.https.onRequest(async (request, response) => {
  const res = await firestore.collection("jobs").listDocuments();
  const ids = res.map((it) => it.id);
  console.log(ids);
  response.send(ids);
});
