import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as geofirestore from "geofirestore";

admin.initializeApp();
const firestore = admin.firestore();
const GeoFirestore = geofirestore.initializeApp(firestore);

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


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
