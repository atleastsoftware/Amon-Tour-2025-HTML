#!/usr/bin/env node
import path from "node:path";
import { buildSite } from "./build.js";
import { fsSource, validateContent } from "./content.js";

function option(name:string,fallback:string):string { const i=process.argv.indexOf(name);return i>=0&&process.argv[i+1]?process.argv[i+1]:fallback; }
async function main(){
  const command=process.argv[2]||"validate",contentDir=path.resolve(option("--content","content"));const result=validateContent(fsSource(contentDir));
  if(!result.ok){console.error(`ERREUR: ${result.error}`);process.exitCode=1;return}
  if(command==="validate"){console.log(`OK — contenu valide (${result.content.pages.length} pages, ${result.content.blog.posts.length} articles)`);return}
  if(command!=="build"){console.error("Usage: cli.ts validate | build [--out site/dist] [--content content]");process.exitCode=1;return}
  const report=await buildSite(result.content,{outDir:path.resolve(option("--out","site/dist"))});
  console.log(`Build OK — ${report.files} fichiers en ${report.duration} ms`);
  console.log(Object.entries(report.routesByKind).map(([k,v])=>`${k}: ${v}`).join(", "));
  const unsupported=Object.entries(report.unsupportedSections);if(unsupported.length)console.warn("Sections non prises en charge:",unsupported.map(([k,v])=>`${k} (${v})`).join(", "));
}
main().catch(e=>{console.error(e);process.exitCode=1});