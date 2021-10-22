const { Command } = require("commander");
const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version, "-v, --version", "output version");

program
  .command("yc <name>")
  .description("打印name")
  .option('-n, --name <name> [smallName]', '王艳', '考拉')
  .action((name, option) => {
    console.log(name, option);
  });

program.parse(process.argv);
