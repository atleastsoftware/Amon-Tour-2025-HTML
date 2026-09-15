import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { LocalRepo } from "../src/repo/local.js";
import { addSection, applyChanges, assertValid, updateSeo } from "../src/cms.js";

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "amon-mcp-"));
  await fs.cp(path.resolve("content"), path.join(root, "content"), { recursive: true });
  await fs.mkdir(path.join(root, "media"), { recursive: true });
  await fs.copyFile(path.resolve("media/manifest.json"), path.join(root, "media/manifest.json"));
  return { root, repo: new LocalRepo(root) };
}

test("updateSeo modifie Tours et conserve un arbre valide", async (t) => {
  const { root, repo } = await fixture(); t.after(() => fs.rm(root, { recursive: true, force: true }));
  const tree = await repo.readTree();
  const mutation = updateSeo(tree.files, "tours", "en", { title: "Tours in Krabi" });
  assertValid(tree.files, mutation.changes);
  await repo.commit(mutation.changes, { message: "test" });
  const page = JSON.parse(await fs.readFile(path.join(root, "content/pages/tours.json"), "utf8"));
  assert.equal(page.seo.en.title, "Tours in Krabi");
});

test("addSection ajoute un bloc text valide", async (t) => {
  const { root, repo } = await fixture(); t.after(() => fs.rm(root, { recursive: true, force: true }));
  const tree = await repo.readTree();
  const mutation = addSection(tree.files, "tours", { type: "text", props: { title: "Test", content: "Texte" } });
  const content = assertValid(applyChanges(tree.files, mutation.changes));
  assert.equal(content.pages.find((p) => p.slug === "tours")?.sections.at(-1)?.type, "text");
});

test("un type de section inconnu est refusé sans écriture", async (t) => {
  const { root, repo } = await fixture(); t.after(() => fs.rm(root, { recursive: true, force: true }));
  const tree = await repo.readTree();
  assert.throws(() => addSection(tree.files, "tours", { type: "inconnu" as any, props: {} }), /Validation du contenu refusée/);
  const after = await repo.readTree();
  assert.equal(after.files.get("content/pages/tours.json"), tree.files.get("content/pages/tours.json"));
});

test("le balisage exécutable est refusé sans écriture", async (t) => {
  const { root, repo } = await fixture(); t.after(() => fs.rm(root, { recursive: true, force: true }));
  const tree = await repo.readTree();
  assert.throws(
    () => addSection(tree.files, "tours", { type: "text", props: { content: "<script>alert(1)</script>" } }),
    /balisage exécutable interdit/,
  );
  const after = await repo.readTree();
  assert.equal(after.files.get("content/pages/tours.json"), tree.files.get("content/pages/tours.json"));
});

test("les variantes HTML exécutables sont toutes refusées", async (t) => {
  const { root, repo } = await fixture(); t.after(() => fs.rm(root, { recursive: true, force: true }));
  const tree = await repo.readTree();
  for (const content of [
    "<svg/onload=alert(1)>",
    "<img src=x onerror=alert(1)>",
    '<a href="java&#x73;cript:alert(1)">Lien</a>',
    '<div style="background:url(javascript:alert(1))">x</div>',
  ]) {
    assert.throws(
      () => addSection(tree.files, "tours", { type: "text", props: { content } }),
      /balisage exécutable interdit/,
    );
  }
});