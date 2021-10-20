const { Command } = require("commander");
const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version, "-v, --version", "output version");

program
  .command("create <name>")
  .description("根据模板名创建仓库")
  .action((name) => {
    console.log(name);
  });

program.parse(process.argv);
