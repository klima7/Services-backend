import * as admin from "firebase-admin";

admin.initializeApp();

import * as experts from "./services/experts/index";
import * as clients from "./services/clients/index";
import * as jobs from "./services/jobs";
import * as offers from "./services/offers";
import * as messages from "./services/messages";
import * as ratings from "./services/ratings";

exports.experts = experts;
exports.clients = clients;
exports.jobs = jobs;
exports.offers = offers;
exports.messages = messages;
exports.ratings = ratings;
