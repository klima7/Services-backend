import * as admin from "firebase-admin";

admin.initializeApp();

import * as experts from "./services/experts/index";
import * as clients from "./services/clients/index";
import * as jobs from "./services/jobs/index";
import * as offers from "./services/offers/index";
import * as messages from "./services/messages/index";
import * as ratings from "./services/ratings/index";

exports.experts = experts;
exports.clients = clients;
exports.jobs = jobs;
exports.offers = offers;
exports.messages = messages;
exports.ratings = ratings;
