"use strict";
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  };
  if ((event.httpMethod || "GET").toUpperCase() === "OPTIONS") return { statusCode: 204, headers, body: "" };
  return { statusCode: 403, headers, body: JSON.stringify({ error: "整表覆盖与回档功能已关闭，请由仓库管理员手动操作。" }) };
};
