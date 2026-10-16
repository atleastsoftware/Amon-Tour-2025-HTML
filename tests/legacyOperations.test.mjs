import test from "node:test";
import assert from "node:assert/strict";
import { customTourCsv, persistCustomTour, notificationMessage, syncKeys, initialAdminPassword } from "../server/customTourRecovery.mjs";
import { publishedTours, loadPublishedTours } from "../server/tourNinjaPublicCatalog.mjs";

const row = {
  id: 210, fullName: "Synthetic Visitor", email: "visitor@example.test", phoneNumber: "+66000000000",
  numberOfAdults: 2, numberOfKids: 1, tripDates: "2026-11-20", duration: "3 days",
  tripTypes: ["private"], destinations: ["Krabi"], message: "Fixture only", status: "new",
  createdAt: "2026-09-15T00:00:00+07:00",
};
const env = { SENDGRID_API_KEY: "synthetic-provider-credential", MAIL_FROM_EMAIL: "sender@example.test" };

test("Custom Trip persists before provider acceptance and mails only the configured agency", async () => {
  const order = [];
  const result = await persistCustomTour(async () => { order.push("saved"); return row; }, {
    env, fetcher: async (url, options) => {
      order.push("mail");
      assert.equal(url, "https://api.sendgrid.com/v3/mail/send");
      assert.equal(options.redirect, "error");
      const body = JSON.parse(options.body);
      assert.equal(body.personalizations[0].to[0].email, "info@amon-tour.com");
      assert.equal(body.from.email, "sender@example.test");
      assert.equal(body.content[0].type, "text/plain");
      for (const field of [row.fullName, row.email, row.phoneNumber, row.tripDates, row.message])
        assert.ok(body.content[0].value.includes(field));
      assert.equal(body.reply_to.email, row.email);
      return { status: 202 };
    },
  });
  assert.deepEqual(order, ["saved", "mail"]);
  assert.equal(result.request, row);
  assert.equal(result.notification, "accepted");
});
test("mail transport absence preserves the request and reports configuration missing", async () => {
  let called = false;
  const result = await persistCustomTour(async () => row, { env: {}, fetcher: async () => { called = true; } });
  assert.equal(result.notification, "not_configured");
  assert.equal(result.request, row);
  assert.equal(called, false);
});
test("provider failure or timeout never erases an accepted request or claims mail delivery", async () => {
  for (const fetcher of [async () => ({ status: 500 }), async () => { throw new Error("synthetic transport error"); }]) {
    const result = await persistCustomTour(async () => row, { env, fetcher });
    assert.equal(result.notification, "failed");
    assert.equal(result.request, row);
  }
});
test("a persistence failure sends no mail; malformed operator address sends nothing", async () => {
  let calls = 0;
  const fetcher = async () => { calls++; return { status: 202 }; };
  await assert.rejects(persistCustomTour(async () => { throw new Error("synthetic database failure"); }, { env, fetcher }));
  assert.equal(calls, 0);
  const bad = await persistCustomTour(async () => row, { env: { ...env, NOTIFICATION_TO_EMAIL: "bad\r\naddress" }, fetcher });
  assert.equal(bad.notification, "failed");
  assert.equal(calls, 0);
});
test("notification subject and recipient never come from untrusted form control fields", () => {
  const body = notificationMessage({ ...row, to: "other@example.test", subject: "injected", email: "bad\r\nheader" }, {});
  assert.equal(body.personalizations[0].to[0].email, "info@amon-tour.com");
  assert.equal(body.subject, "Amon Tour - Custom Trip #210");
  assert.equal(body.reply_to, undefined);
});
test("recovery CSV respects the Bangkok cutoff, preserves quoting and neutralizes spreadsheet formulas", () => {
  const old = { ...row, id: 209, createdAt: "2026-09-14T23:59:59+07:00" };
  const hostile = { ...row, fullName: '=HYPERLINK("https://example.test")', message: 'a "quote",\nand a newline' };
  const csv = customTourCsv([old, hostile], "2026-09-15T00:00:00+07:00");
  assert.ok(csv.includes('"210"'));
  assert.ok(!csv.includes('"209"'));
  assert.ok(csv.includes("\"'=HYPERLINK(\"\"https://example.test\"\")\""));
  assert.ok(csv.includes('"a ""quote"",\nand a newline"'));
  assert.ok(csv.includes(row.phoneNumber));
  assert.equal(customTourCsv([row]).split("\r\n").length, 3);
  assert.throws(() => customTourCsv([row], "2026-09-15"), RangeError);
  assert.throws(() => customTourCsv([{ ...row, createdAt: null }], "2026-09-15T00:00:00Z"), RangeError);
});
test("sync and admin bootstrap have no embedded/default credential", () => {
  assert.deepEqual(syncKeys({}), []);
  assert.deepEqual(syncKeys({ TOUR_NINJA_API_KEY: "fixture-key", TOUR_NINJA_SYNC_TOKEN: "fixture-key" }), ["fixture-key"]);
  assert.deepEqual(syncKeys({ TOUR_NINJA_API_KEY: " " }), []);
  assert.equal(initialAdminPassword({}), undefined);
  assert.equal(initialAdminPassword({ ADMIN_PASSWORD: "fixture-password" }), "fixture-password");
});
const product = { id: "public-offer", name: "Synthetic Amon tour", description: "Public description",
  currency: "THB", price: 350000, image: "/api/photo/synthetic", photos: [], duration: "1 day", destination: "Krabi", cost: 123, netPrice: 456 };
const view = { config: { slug: "amon-tour" }, demo: false, products: [product] };
test("current published catalogue converts minor units and emits native, agency-scoped V2 links", () => {
  const [tour] = publishedTours(view);
  assert.equal(tour.price, 3500);
  assert.equal(tour.bookingUrl, "https://www.tourninja.io/embed/amon-tour?offer=public-offer");
  assert.equal(tour.detailsUrl, tour.bookingUrl);
  assert.deepEqual(tour.images, ["https://www.tourninja.io/api/photo/synthetic"]);
  assert.equal("cost" in tour, false);
  assert.equal("netPrice" in tour, false);
  const [jpy] = publishedTours({ ...view, products: [{ ...product, currency: "JPY", price: 3500 }] });
  assert.equal(jpy.price, 3500);
});
test("foreign/demo/malformed catalogues and unsafe images never become published offers", () => {
  assert.throws(() => publishedTours({ ...view, config: { slug: "other-agency" } }));
  assert.throws(() => publishedTours({ ...view, demo: true }));
  assert.throws(() => publishedTours({ ...view, products: [{ ...product, price: -1 }] }));
  const [tour] = publishedTours({ ...view, products: [{ ...product, image: "javascript:alert(1)", photos: ["https://user:password@example.test/image"] }] });
  assert.deepEqual(tour.images, []);
});
test("catalogue fetch uses the fixed public endpoint without old credentials or redirects", async () => {
  const result = await loadPublishedTours("fr", async (url, options) => {
    assert.equal(url, "https://www.tourninja.io/api/public/sites/amon-tour");
    assert.equal(options.headers["Accept-Language"], "fr");
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.redirect, "error");
    return { ok: true, json: async () => view };
  });
  assert.equal(result.length, 1);
  await assert.rejects(loadPublishedTours("en", async () => ({ ok: false })));
});
