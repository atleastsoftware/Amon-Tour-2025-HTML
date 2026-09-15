import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { SITE_JS } from "../src/assets.js";

test("showcase navigateur : même jeton en anglais, français et espagnol", () => {
  for (const prefix of ["", "/fr", "/es"]) {
    const calls: string[] = [];
    vm.runInNewContext(SITE_JS, {
      location: { pathname: `${prefix}/tour/test-tour`, search: "" },
      localStorage: { getItem: () => null },
      document: {
        documentElement: { lang: prefix.slice(1) || "en" },
        querySelectorAll: () => [],
        querySelector: (selector: string) => selector === ".js-tour-showcase" ? {} : null,
      },
      fetch: (url: string) => {
        calls.push(url);
        return new Promise(() => {});
      },
    });
    assert.deepEqual(calls, ["/api/public/tour-showcase/test-tour"], prefix);
  }
});

test("publication : les conditions Actions utilisent env, pas secrets", () => {
  const workflow = fs.readFileSync(".github/workflows/content-ci.yml", "utf8");
  assert.doesNotMatch(workflow, /^\s*if:.*secrets\./m);
  for (const key of ["DEPLOY_HOOK_URL", "EDGE_REBUILD_URL", "PUBLISH_WEBHOOK_SECRET"]) {
    assert.ok(workflow.includes(`${key}: \${{ secrets.${key} }}`));
    assert.ok(workflow.includes(`env.${key} != ''`));
  }
});

test("iframe : seuls les liens HTTPS Tour Ninja sans identifiants sont acceptés", () => {
  const run = (source: string | null, returnUrl = "/experiences") => {
    const holder: any = { insertAdjacentText: (_position: string, text: string) => { holder.error = text; } };
    const redirects: string[] = [];
    const params = new URLSearchParams({ return: returnUrl });
    if (source !== null) params.set("url", source);
    vm.runInNewContext(SITE_JS, {
      URL, URLSearchParams,
      location: { pathname: "/tour-ninja-iframe", search: `?${params}`, replace: (url: string) => redirects.push(url) },
      localStorage: { getItem: () => null },
      document: {
        documentElement: { lang: "fr" },
        querySelectorAll: () => [],
        querySelector: (selector: string) => selector === "[data-tour-ninja-iframe]" ? holder : null,
      },
    });
    return { holder, redirects };
  };
  for (const source of [
    "javascript:parent.alert(1)", "data:text/html,<script>alert(1)</script>",
    "http://tourninja.io/details/id", "https://tourninja.io.evil.test/details/id",
    "https://tourninja.io@evil.test/details/id", "https://user:pass@tourninja.io/details/id",
    "https://tourninja.io:8443/details/id", "//evil.test", "/relative",
  ]) {
    const { holder } = run(source);
    assert.equal(holder.src, undefined, source);
    assert.equal(holder.hidden, true);
    assert.match(holder.error, /Invalid Tour Ninja link/);
  }
  for (const host of ["tourninja.io", "www.tourninja.io"]) {
    for (const route of ["details", "book"]) {
      const { holder } = run(`https://${host}/${route}/id`);
      assert.equal(holder.src, `https://${host}/${route}/id?language=fr&lang=fr`);
    }
  }
  assert.deepEqual(run(null, "javascript:alert(1)").redirects, ["/experiences"]);
  assert.deepEqual(run(null, "//evil.test").redirects, ["/experiences"]);
  assert.deepEqual(run(null, "/fr/tours?q=test").redirects, ["/fr/tours?q=test"]);
});