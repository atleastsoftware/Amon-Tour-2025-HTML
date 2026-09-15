import assert from "node:assert/strict";
import test from "node:test";
import { Pool } from "@neondatabase/serverless";
import { EdgeStorage } from "../src/storage.js";

test("PostgreSQL : les tableaux voyage sont encodés en JSON, jamais en tableaux pg", async (t) => {
  // Remplace la connexion héritée par une adresse fictive. query est intercepté :
  // aucune connexion ni écriture dans une base réelle.
  process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
  let calls = 0;
  t.mock.method(Pool.prototype, "query", async (sql: string, params: unknown[]) => {
    calls++;
    assert.match(sql, /^INSERT INTO "custom_tour_requests"/);
    const columns = [...sql.matchAll(/"([a-z_]+)"/g)].slice(1).map((match) => match[1]);
    const values = Object.fromEntries(columns.map((column, index) => [column, params[index]]));
    assert.equal(values.interests, '["kayak","sunset"]');
    assert.equal(values.trip_types, '["family"]');
    assert.equal(values.destinations, calls === 1 ? '["Krabi","Koh Phi Phi"]' : "[]");
    assert.equal(values.number_of_adults, 2);
    assert.equal(values.email, "fixture@example.invalid");
    return { rows: [{ id: calls, ...values, interests: JSON.parse(values.interests as string),
      trip_types: JSON.parse(values.trip_types as string), destinations: JSON.parse(values.destinations as string) }] };
  });
  try {
    const storage = new EdgeStorage("/unused-test-root");
    for (const destinations of [["Krabi", "Koh Phi Phi"], []]) {
      const record = await storage.insert("custom_tour_requests", {
        fullName: "Test Fixture", email: "fixture@example.invalid", phoneNumber: "000000000",
        numberOfAdults: 2, numberOfKids: 0, message: "Test only",
        interests: ["kayak", "sunset"], tripTypes: ["family"], destinations,
      });
      assert.deepEqual(record.tripTypes, ["family"]);
      assert.deepEqual(record.destinations, destinations);
    }
    assert.equal(calls, 2);
  } finally {
    delete process.env.DATABASE_URL;
  }
});