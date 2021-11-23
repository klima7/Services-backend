import * as admin from "firebase-admin";

admin.initializeApp();

import * as tests from "./tests";
import * as experts from "./experts";
import * as clients from "./clients";
import * as jobs from "./jobs";
import * as offers from "./offers";
import * as messages from "./messages";
import * as ratings from "./ratings";

exports.tests = tests;
exports.experts = experts;
exports.clients = clients;
exports.jobs = jobs;
exports.offers = offers;
exports.messages = messages;
exports.ratings = ratings;
