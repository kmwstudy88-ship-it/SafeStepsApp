import { createHash } from "node:crypto";

// Conservative lexical comparison, not a PostgreSQL parser or semantic proof.
// Quoted strings, identifiers and dollar-quoted bodies remain byte-sensitive.
export function sqlTokens(sql) {
  const tokens = [];
  let i = 0;
  let lastStringEnd = -1;
  while (i < sql.length) {
    if (/\s/.test(sql[i])) { i++; continue; }
    if (sql.startsWith("--", i)) {
      const end = sql.indexOf("\n", i);
      i = end < 0 ? sql.length : end + 1;
      continue;
    }
    if (sql.startsWith("/*", i)) {
      let depth = 1;
      i += 2;
      while (i < sql.length && depth) {
        if (sql.startsWith("/*", i)) { depth++; i += 2; }
        else if (sql.startsWith("*/", i)) { depth--; i += 2; }
        else i++;
      }
      if (depth) throw new Error("Unterminated SQL comment");
      continue;
    }
    const dollar = sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0];
    if (dollar) {
      const end = sql.indexOf(dollar, i + dollar.length);
      if (end < 0) throw new Error("Unterminated dollar quote");
      tokens.push(sql.slice(i, end + dollar.length));
      i = end + dollar.length;
      continue;
    }
    const prefix = sql.slice(i).match(/^(?:[eEbBxX](?=')|[uU]&(?=['"]))/)?.[0] ?? "";
    if (prefix || sql[i] === "'" || sql[i] === '"') {
      const start = i;
      i += prefix.length;
      const quote = sql[i++];
      const escapedString = quote === "'" && /^[eE]$/.test(prefix);
      let closed = false;
      while (i < sql.length) {
        if (escapedString && sql[i] === "\\") { i += 2; continue; }
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) { i += 2; continue; }
          i++; closed = true; break;
        }
        i++;
      }
      if (!closed) throw new Error("Unterminated SQL quote");
      if (quote === "'" && lastStringEnd >= 0 && tokens.at(-1)?.endsWith("'")) {
        // PostgreSQL concatenates adjacent string literals only when separated
        // by whitespace containing a newline. Preserve this lexical distinction.
        const separator = sql.slice(lastStringEnd, start);
        tokens.push(/\/\*|--/.test(separator)
          ? `<comment-string-separator:${separator}>`
          : /[\r\n]/.test(separator) ? "<newline-string-separator>" : "<space-string-separator>");
      }
      tokens.push(sql.slice(start, i));
      lastStringEnd = quote === "'" ? i : -1;
      continue;
    }
    const atom = sql.slice(i).match(/^(?:[A-Za-z_][A-Za-z0-9_$]*|[0-9]+(?:\.[0-9]+)?|::|->>|->|>=|<=|<>|!=|\|\|)/)?.[0];
    if (atom) { tokens.push(atom); i += atom.length; }
    else { tokens.push(sql[i++]); }
  }
  // Recovery joins history statement arrays; consecutive semicolons add only
  // empty statements. Do not remove other statement separators.
  const nonempty = tokens.filter((token, index) => token !== ";" || tokens[index - 1] !== ";");
  if (nonempty.at(-1) !== ";" && nonempty.length) nonempty.push(";");
  return nonempty;
}

export function sqlFingerprint(sql) {
  return createHash("sha256").update(JSON.stringify(sqlTokens(sql))).digest("hex");
}
