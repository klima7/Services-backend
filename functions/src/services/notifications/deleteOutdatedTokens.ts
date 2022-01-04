import * as functions from "firebase-functions";
import {deleteOutdatedTokens} from "../../lib/tokens";


export const periodicallyDeleteOutdatedTokens = functions.pubsub.schedule("0 0 01 */2 *")
    .timeZone("Europe/Warsaw")
    .onRun(async (_context) => {
      await deleteOutdatedTokens();
    });


export const onRequestDeleteOutdatedTokens = functions.https.onRequest(async (_request, response) => {
  await deleteOutdatedTokens();
  response.send("Done");
});
