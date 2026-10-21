'use strict';

const path = require('path');

const projectsRoot = process.env.BOX_LOCAL_PROJECTS_PATH;
const archive = process.argv[2];
const version = process.argv[3] || '1.0.0';
if (!projectsRoot || !archive) {
  throw new Error('usage: build-worker <archive> <version> (BOX_LOCAL_PROJECTS_PATH required)');
}

const pm = require('./project-manager.js');
const imported = pm.importProject(archive);
const release = pm.publishProject(imported.id, version);
const releaseRoot = path.join(projectsRoot, release.id, 'releases', release.version);
process.stdout.write(JSON.stringify({ imported, release, releaseRoot }));
