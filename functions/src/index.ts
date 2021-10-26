import * as admin from "firebase-admin";

admin.initializeApp();

import * as tests from "./tests";
import * as experts from "./experts";
import * as clients from "./clients";
import * as jobs from "./jobs";

exports.tests = tests;
exports.experts = experts;
exports.clients = clients;
exports.jobs = jobs;
