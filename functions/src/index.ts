import * as admin from "firebase-admin";

admin.initializeApp();

import * as tests from "./tests";
import * as experts from "./experts";

exports.tests = tests;
exports.experts = experts;
