import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Client} from "../../interfaces/firestore";
import * as Joi from "joi";

const firestore = admin.firestore();

abstract class SetInfoParams {
  abstract name: string | null;
  abstract phone: string | null;

  static schema = Joi.object({
    name: Joi.string().required().min(1).max(40),
    phone: Joi.string().allow(null).length(9),
  });
}

export const setInfo = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (uid == undefined) {
    throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
  }

  const params: SetInfoParams = data;
  const validation = SetInfoParams.schema.validate(params);
  if (validation.error) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid parameters passed");
  }

  // Check whether client has an account
  const client = (await firestore.collection("clients").doc(uid).get()).data() as Client;
  if (client == null) {
    throw new functions.https.HttpsError("failed-precondition", "User does not have account");
  }

  const clientData: Partial<Client> = {
    info: {
      name: params.name,
      phone: params.phone,
    },
  };

  await firestore.collection("clients").doc(uid).update(clientData);
});
