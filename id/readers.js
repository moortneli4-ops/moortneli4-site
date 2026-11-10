(function (root) {
  function findTag(bytes, tag) {
    const a = tag.charCodeAt(0);
    const b = tag.charCodeAt(1);
    const c = tag.charCodeAt(2);
    const d = tag.charCodeAt(3);
    for (let i = 0; i <= bytes.length - 4; i += 1) {
      if (bytes[i] === a && bytes[i + 1] === b && bytes[i + 2] === c && bytes[i + 3] === d) return i;
    }
    return -1;
  }

  function trimNum(value) {
    return String(Math.round(value * 10) / 10);
  }

  function parseMgxcBytes(bytes, file) {
    const start = findTag(bytes, "titl");
    if (start < 0) return null;
    const text = new TextDecoder("utf-8");
    const fields = {};
    let i = start;
    while (i + 8 <= bytes.length) {
      const tag = text.decode(bytes.subarray(i, i + 4));
      if (!/^[a-z]{4}$/.test(tag)) break;
      const type = bytes[i + 4] | (bytes[i + 5] << 8);
      if (type === 4) {
        const length = bytes[i + 6] | (bytes[i + 7] << 8);
        if (i + 8 + length > bytes.length) break;
        fields[tag] = text.decode(bytes.subarray(i + 8, i + 8 + length));
        i += 8 + length;
      } else if (type === 1) {
        fields[tag] = bytes[i + 6] | (bytes[i + 7] << 8);
        i += 8;
      } else if (type === 3) {
        if (i + 16 > bytes.length) break;
        fields[tag] = new DataView(bytes.buffer, bytes.byteOffset + i + 8, 8).getFloat64(0, true);
        i += 16;
      } else {
        break;
      }
    }
    const id = Number(fields.sgid);
    if (!Number.isInteger(id) || id <= 0) return null;
    const diffName = { 0: "Basic", 1: "Advanced", 2: "Expert", 3: "Master", 4: "Ultima", 5: "WE" }[fields.diff] || "";
    const status = { 2: "自制红", 3: "自制紫", 4: "自制黑", 5: "自制WE" }[fields.diff] || "";
    const level = typeof fields.cnst === "number" && fields.cnst > 0
      ? trimNum(fields.cnst)
      : (fields.plvl || "");
    const artist = fields.arts || "";
    const levelBit = level && diffName ? `${level} ${diffName}` : (level || diffName);
    return {
      id,
      title: fields.titl || "",
      charter: fields.dsgn || "",
      status,
      chart: "已完成",
      convert: "未完成",
      note: [levelBit, artist].filter(Boolean).join(" / "),
      file: file || "",
      origin: "mgxc",
    };
  }

  function parseRanges(text) {
    const spans = [];
    for (const part of String(text || "").split(/[、；，,]/)) {
      const range = part.match(/(\d+)\s*[-~～]\s*(\d+)/);
      if (range) {
        const a = Number(range[1]);
        const b = Number(range[2]);
        spans.push([Math.min(a, b), Math.max(a, b)]);
        continue;
      }
      const single = part.match(/(\d+)/);
      if (single) spans.push([Number(single[1]), Number(single[1])]);
    }
    return spans;
  }

  root.parseMgxcBytes = parseMgxcBytes;
  root.parseRanges = parseRanges;
})(typeof globalThis !== "undefined" ? globalThis : window);
