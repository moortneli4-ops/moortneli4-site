"use strict";
const { invoke } = require("./_adapter");
exports.handler = async (event) => invoke(event, "reserves");
