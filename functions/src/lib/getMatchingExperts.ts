import * as admin from "firebase-admin";
import * as geofirestore from "geofirestore";
import {Job} from "../interfaces/firestore";


const firestore = admin.firestore();
const GeoFirestore = geofirestore.initializeApp(firestore);


export async function getMatchingExperts(job: Job): Promise<Array<string>> {
  const geocollection = GeoFirestore.collection("experts", "workingArea.coordinates");

  const query = geocollection
      .near({center: job.location.coordinates, radius: 10000})
      .where("workingArea.radius", "==", 12)
      .where("services", "array-contains", job.serviceId)
      .where("ready", "==", true);

  const expertsIds = (await query.get()).docs.map((it)=>it.id);
  return expertsIds;
}
