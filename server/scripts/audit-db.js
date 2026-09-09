import fs from "node:fs";
import { pool, schema } from "../src/config/database.js";
const dump = fs.readFileSync(
  new URL("../../database/DroneXperience.sql", import.meta.url),
  "utf8",
);
const tables = [
  ...dump.matchAll(
    /CREATE TABLE dronexperience_01_normalizada\.(\w+) \(([\s\S]*?)\n\);/g,
  ),
];
const report = { database: null, schema, tables: [], mismatches: [] };
try {
  report.database = (
    await pool.query("SELECT current_database() AS name")
  ).rows[0].name;
  for (const [, name, body] of tables) {
    const actual = (
      await pool.query(
        "SELECT column_name,is_nullable,data_type,character_maximum_length,numeric_precision,numeric_scale FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position",
        [schema, name],
      )
    ).rows;
    const expected = body
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v && !v.startsWith("CONSTRAINT"))
      .map((v) => ({
        name: v.split(" ")[0],
        required: v.includes("NOT NULL"),
      }));
    if (
      JSON.stringify(
        actual.map((v) => [v.column_name, v.is_nullable === "NO"]),
      ) !== JSON.stringify(expected.map((v) => [v.name, v.required]))
    )
      report.mismatches.push(name);
    const constraints = (
      await pool.query(
        "SELECT conname,pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname=$1 AND t.relname=$2 ORDER BY conname",
        [schema, name],
      )
    ).rows;
    const expectedConstraints = [
      ...dump.matchAll(
        new RegExp(
          "ALTER TABLE ONLY dronexperience_01_normalizada\\." +
            name +
            "\\s+ADD CONSTRAINT (\\w+) ([^;]+);",
          "g",
        ),
      ),
    ];
    for (const [, constraint, definition] of expectedConstraints) {
      const actualConstraint = constraints.find(
        (c) => c.conname === constraint,
      );
      const normalize = (value) => value.replace(/\s+/g, " ").trim();
      if (
        !actualConstraint ||
        normalize(actualConstraint.definition) !== normalize(definition)
      )
        report.mismatches.push(name + "." + constraint);
    }
    for (const column of actual) {
      const source = body
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.startsWith(column.column_name + " "));
      let expectedType = source
        ?.slice(column.column_name.length + 1)
        .split(/ DEFAULT| NOT NULL|,$/)[0];
      let actualType = column.data_type;
      if (actualType === "character varying")
        actualType += "(" + column.character_maximum_length + ")";
      if (actualType === "numeric")
        actualType +=
          "(" + column.numeric_precision + "," + column.numeric_scale + ")";
      if (expectedType !== actualType)
        report.mismatches.push(name + "." + column.column_name + ": tipo");
    }
    const count = (
      await pool.query(`SELECT count(*)::int AS total FROM ${schema}.${name}`)
    ).rows[0].total;
    report.tables.push({ name, count, columns: actual, constraints });
  }
  fs.mkdirSync(new URL("../../artifacts/", import.meta.url), {
    recursive: true,
  });
  fs.writeFileSync(
    new URL("../../artifacts/database-audit.json", import.meta.url),
    JSON.stringify(report, null, 2),
  );
  console.info(
    JSON.stringify(
      {
        database: report.database,
        schema,
        tables: report.tables.map((t) => ({ name: t.name, count: t.count })),
        mismatches: report.mismatches,
      },
      null,
      2,
    ),
  );
  if (report.mismatches.length) process.exitCode = 1;
} finally {
  await pool.end();
}
