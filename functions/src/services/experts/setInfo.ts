import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Joi from "joi";
import {Expert, ExpertUpdate} from "../../interfaces/firestore";

const firestore = admin.firestore();


interface SetInfoParams {
  name: string | null;
  company: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}


const schemaSetInfoParams = Joi.object({
  name: Joi.string().required().min(1).max(40),
  company: Joi.string().allow(null).min(1).max(40),
  description: Joi.string().allow(null).min(1).max(500),
  email: Joi.string().allow(null).min(1).max(50),
  phone: Joi.string().allow(null).length(9),
  website: Joi.string().allow(null).min(1).max(200),
});


export const setInfo = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: SetInfoParams = data;
  const validation = schemaSetInfoParams.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  // Check whether user has an expert account
  const expert = (await firestore.collection("experts").doc(uid).get()).data() as Expert;
  if (expert == null) {
    throw new functions.https.HttpsError("failed-precondition", "User does not have expert account");
  }

  const expertData: Partial<ExpertUpdate> = {
    info: {
      company: params.company,
      description: params.description,
      email: params.email,
      name: params.name,
      phone: params.phone,
      website: params.website,
    },
  };

  await firestore.collection("clients").doc(uid).update(expertData);
});
