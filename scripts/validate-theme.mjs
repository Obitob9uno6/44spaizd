import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const requiredDirectories = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates', 'templates/customers'];
const requiredFiles = ['layout/theme.liquid', 'config/settings_schema.json', 'templates/index.json', 'templates/product.json', 'templates/collection.json', 'templates/cart.json', 'templates/404.json'];
const addableSections = new Set(['announcement-bar', 'featured-collection', 'hero', 'newsletter', 'rich-text', 'vip-promo']);
let ok = true;

for (const dir of requiredDirectories) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) fail(`Missing required Shopify theme directory: ${dir}`);
}
for (const file of requiredFiles) {
  if (!existsSync(file)) fail(`Missing required theme file: ${file}`);
}

const sectionFiles = new Set(walk('sections').filter((file) => file.endsWith('.liquid')).map((file) => basename(file, '.liquid')));

for (const dir of ['templates', 'sections', 'config', 'locales']) {
  for (const file of walk(dir).filter((entry) => entry.endsWith('.json'))) {
    const json = parseJsonFile(file);
    if (!json) continue;
    if (file.startsWith('templates/') || file.endsWith('-group.json')) {
      verifySectionReferences(file, json);
    }
  }
}

for (const file of walk('sections').filter((entry) => entry.endsWith('.liquid'))) {
  const text = readFileSync(file, 'utf8');
  const schemaOpen = (text.match(/{% schema %}/g) || []).length;
  const schemaClose = (text.match(/{% endschema %}/g) || []).length;
  if (schemaOpen !== schemaClose) fail(`Unbalanced schema tags in ${file}`);
  if (schemaOpen === 0) fail(`Missing Shopify schema in ${file}`);
  const schema = extractSchema(file, text);
  const handle = basename(file, '.liquid');
  if (schema && addableSections.has(handle) && !Array.isArray(schema.presets)) {
    fail(`Addable Theme Editor section ${file} is missing presets`);
  }
}

if (!ok) process.exit(1);
console.log('Theme structure, JSON templates, section references, and schemas are valid.');

function fail(message) {
  console.error(message);
  ok = false;
}

function parseJsonFile(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`Invalid JSON in ${file}: ${error.message}`);
    return null;
  }
}

function extractSchema(file, text) {
  const match = text.match(/{% schema %}([\s\S]*?){% endschema %}/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch (error) {
    fail(`Invalid schema JSON in ${file}: ${error.message}`);
    return null;
  }
}

function verifySectionReferences(file, json) {
  if (!json.sections) return;
  for (const [id, section] of Object.entries(json.sections)) {
    if (!section?.type) {
      fail(`${file} section "${id}" is missing a type`);
      continue;
    }
    if (!sectionFiles.has(section.type)) fail(`${file} references missing section "${section.type}"`);
  }
  if (Array.isArray(json.order)) {
    for (const id of json.order) {
      if (!json.sections[id]) fail(`${file} order references missing section id "${id}"`);
    }
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') return [];
    return entry.isDirectory() ? walk(path) : [path];
  });
}
