#!/usr/bin/env node

const requireGenerator = process.argv[2];
const {
    question, closeStdin, style, Colors
} = require('../dist/index');

const path = require('path');
const cprocess = require('child_process');
const RootDir = String(cprocess.execSync('npm root -g')).trim();
const generatorPath = path.resolve(RootDir, `${requireGenerator}-rygenerator`);

try {
    const Generator = require(generatorPath);
    Generator(generatorPath, process.cwd(), process.argv.slice(3));
} catch (error) {
    question(
        style(Colors.red, `\nUnable to generate target with "${requireGenerator}-rygenerator". \n`) + 
        style(Colors.black, error.stack, true) + `\n\npress ${style(Colors.cyan, 'Enter')} to exit.`
    )
    .then(() => closeStdin());
}
