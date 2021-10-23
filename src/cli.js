const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const shell = require("shelljs");
const inquirer = require("inquirer");

const pkg = require("../package.json");

const program = new Command();

program.version(pkg.version, "-v, --version", "output version");

program
  .command("create <name>")
  .description("根据模板名创建仓库")
  .option("-r <repo>", "模板地址")
  .action((name, options) => {
    const target = path.join(".", name);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      console.warn(`${name} 仓库已存在, 请更换名称后再试!`);
      shell.exit(1);
    }

    if (!shell.which("git")) {
      console.warn("请先安装 git 命令行工具");
      shell.exit(1);
    }

    const { stdout, stderr, code } = shell.exec(
      `git ls-remote -h ${options.r}`,
      {
        silent: true,
      },
    );

    if (code !== 0 && stderr) {
      shell.echo(`获取模板的远程分支失败: \n${stderr}`);
      shell.exit(1);
    }

    const branches = stdout
      .split("\n")
      .map((line) => {
        const [, branch] = line.split("refs/heads/");
        return branch;
      })
      .filter((branch) => !!branch);

    inquirer
      .prompt({
        type: "list",
        name: "branch",
        message: "请选择模板分支",
        default: "master",
        choices: branches,
        pageSize: 10,
        loop: false,
      })
      .then(({ branch }) => {
        if (!branch) {
          shell.echo("未知选择分支!");
          shell.exit(1);
        }

        shell.exec(`git clone ${options.r} ${name} -b ${branch} --depth=1`);

        if (code !== 0) {
          shell.echo(`仓库克隆失败!`);
          shell.exit(1);
        }
      });
  });

program.parse(process.argv);
