#!/usr/bin/env node
const { Command } = require("commander")
const pkg = require("../package.json")
const program = new Command()

program.version(pkg.version, "-v, --version", "output version");
program
  .command('yy <name>')
  .description('关于王艳的一切')
  .option('-n, --name <name> [smallName]', '王艳', '考拉')
  .option('-a, --age <age>', '23', '23')
  .option('-e, --enjoy [enjoy]', '鱼')
  .action((name) => {
    console.log(name, option);
  });

program.parse(process.argv)
