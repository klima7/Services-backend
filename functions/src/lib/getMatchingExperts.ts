import * as admin from "firebase-admin";
import * as geofirestore from "geofirestore";
import {Job} from "../interfaces/firestore";
import {MAX_WORKING_AREA_RADIUS} from "./constants";


const firestore = admin.firestore();
const GeoFirestore = geofirestore.initializeApp(firestore);


export async function getMatchingExperts(job: Job): Promise<Array<string>> {
  const geocollection = GeoFirestore.collection("experts", "workingArea.coordinates");

  let allMatchingExpertsIds: Array<string> = [];

  for (let radius = 1; radius <= MAX_WORKING_AREA_RADIUS; radius++) {
    const query = geocollection
        .near({center: job.location.coordinates, radius: radius})
        .where("workingArea.radius", "==", radius)
        .where("services", "array-contains", job.serviceId)
        .where("ready", "==", true);

    const partMatchingExpertsIds = (await query.get()).docs.map((it)=>it.id).filter((it)=>it!=job.clientId);
    allMatchingExpertsIds = allMatchingExpertsIds.concat(partMatchingExpertsIds);
  }

  return allMatchingExpertsIds;
}
