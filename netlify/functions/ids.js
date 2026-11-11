"use strict";
const { invoke } = require("./_adapter");
exports.handler = async (event) => invoke(event, (event.httpMethod || "GET").toUpperCase() === "GET" ? "read" : "save");
