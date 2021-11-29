import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {Service, ExpertUpdate} from "../../interfaces/firestore";

const firestore = admin.firestore();


interface SetServicesParams {
  services: Array<string>;
}


const schemaSetServicesParams = Joi.object({
  services: Joi.array().items(Joi.string()).min(1).unique(),
});


export const setServices = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: SetServicesParams = data;
  const validation = schemaSetServicesParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  // Check wheter requested services exist
  for (const providedServiceId of params.services) {
    const service = (await firestore.collection("services").doc(providedServiceId).get()).data() as Service;
    if (service == null) {
      throw new functions.https.HttpsError("invalid-argument", "Requested service does not exist");
    }
  }

  const expertData: Partial<ExpertUpdate> = {
    services: params.services,
  };

  await firestore.collection("experts").doc(uid).update(expertData);
});
