"use strict";

const registryApi = require("../../lib/registry-api");

function responseAdapter() {
  const headers = {};
  let statusCode = 200;
  let body = "";
  return {
    headers,
    get statusCode() { return statusCode; },
    get body() { return body; },
    setHeader(name, value) { headers[name] = value; },
    status(code) { statusCode = code; return this; },
    json(payload) {
      headers["Content-Type"] = "application/json; charset=utf-8";
      body = JSON.stringify(payload);
      return this;
    },
    end(value = "") { body = value; return this; },
  };
}

async function invoke(event, action) {
  const reqHeaders = {};
  for (const [key, value] of Object.entries(event.headers || {})) {
    reqHeaders[key.toLowerCase()] = value;
  }
  const req = {
    method: event.httpMethod || event.requestContext?.http?.method || "GET",
    headers: reqHeaders,
    body: event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : (event.body || ""),
  };
  const res = responseAdapter();
  await registryApi.handle(req, res, action);
  return {
    statusCode: res.statusCode,
    headers: res.headers,
    body: res.body,
  };
}

module.exports = { invoke };
