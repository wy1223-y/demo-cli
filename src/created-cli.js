const { Command } = require("commander");
const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version, "-v, --version", "output version");

program
  .version('0.1.0')
  .argument('<username>', 'user')
  .argument('[password]', 'password', 'password')
  .description('登录')
  .action((username, password) => {
    console.log('username:', username);
    console.log('password:', password);
  });
program.parse(process.argv);
