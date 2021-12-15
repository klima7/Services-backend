import * as functions from "firebase-functions";
import {deleteOutdatedTokens} from "../../lib/tokens";


export const onRequestDeleteOutdatedTokens = functions.https.onRequest(async (_request, response) => {
  await deleteOutdatedTokens();
  response.send("Done");
});
