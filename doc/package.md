# package.json

---

## 语义化版本

---

npm 依赖管理的一个重要特性是采用了语义化版本 (semver) 规范作为依赖版本管理方案. semver 约定一个包的版本号必须包含 3 个数字, 格式必须为 `MAJOR.MINOR.PATCH`, 意为 `主版本号.小版本号.修订版本号`:

- `MAJOR` 对应大的版本号迭代, 做了不兼容旧版的修改时要更新 `MAJOR` 版本号
- `MINOR` 对应小版本迭代, 发生兼容旧版 API 的修改或功能更新时, 更新 `MINOR` 版本号
- `PATCH` 对应修订版本号, 一般针对修复 BUG 的版本号

对于包作者 (发布者), npm 要求在 publish 之前, 必须更新版本号. npm 提供了 `npm version` 工具, 执行 `npm version major|minor|patch` 可以简单地将版本号中相应的数字加 `1`. 如果包是一个 git 仓库, `npm version` 还会自动创建一条注释为更新后版本号的 git commit 和名为该版本号的 tag.

对于包的引用者来说, 我们需要在 `dependencies` 中使用 semver 约定的 semver range 指定所需依赖包的版本号或版本范围. npm 提供了网站 `https://semver.npmjs.com` 可方便地计算所输入的表达式的匹配范围. 常用的规则示例如下表:

- `^2.2.1` 指定的 `MAJOR` 版本号下, 所有更新的版本. 匹配 2.2.3, 2.3.0; 不匹配 1.0.3, 3.0.1
- `~2.2.1` 指定 `MAJOR.MINOR` 版本号下，所有更新的版本. 匹配 2.2.3, 2.2.9; 不匹配 2.3.0, 2.4.5
- `>=2.1` 版本号大于或等于 2.1.0, 匹配 2.1.2, 3.1
- `<=2.2` 版本号小于或等于 2.2, 匹配 1.0.0, 2.2.1, 2.2.11
- `1.0.0 - 2.0.0` 版本号从 1.0.0 (含) 到 2.0.0 (含), 匹配 1.0.0, 1.3.4, 2.0.0

1. 任意两条规则用 `空格` 连接起来，表示与逻辑, 即两条规则的交集, 如 `>=2.3.1 <=2.8.0` 可以解读为: `>=2.3.1 且 <=2.8.0`

   - 可以匹配 2.3.1, 2.4.5, 2.8.0
   - 但不匹配 1.0.0, 2.3.0, 2.8.1, 3.0.0

2. 任意两条规则, 通过 `||` 连接起来, 表示或逻辑, 即两条规则的并集, 如 `^2 >=2.3.1 || ^3 >3.2`

   - 可以匹配 2.3.1, 2,8.1, 3.3.1
   - 但不匹配 1.0.0, 2.2.0, 3.1.0, 4.0.0

3. 除了这几种, 还有如下更直观的表示版本号范围的写法:

   - `*` 或 `x` 匹配所有主版本
   - 1 或 1.x 匹配主版本号为 1 的所有版本
   - 1.2 或 1.2.x 匹配版本号为 1.2 开头的所有版本

4. 在常规仅包含数字的版本号之外, semver 还允许在 `MAJOR.MINOR.PATCH` 后追加 `-` 后跟点号分隔的标签, 作为预发布版本标签 - [Prerelese Tags](https://github.com/npm/node-semver#prerelease-tags), 通常被视为不稳定、不建议生产使用的版本. 例如:

   - `1.0.0-alpha`
   - `1.0.0-beta.1`
   - `1.0.0-rc.3`

   上表中我们最常见的是 `^1.8.11` 这种格式的 range, 因为我们在使用 `npm install <package name>` 安装包时, npm 默认安装当前最新版本, 例如 `1.8.11`, 然后在所安装的版本号前加 `^` 号, 将 `^1.8.11` 写入 `package.json` 依赖配置, 意味着可以匹配 1.8.11 以上, 2.0.0 以下的所有版本

## 包定义

---

要手动安装一个包时, 执行 `npm install <package>` 命令即可. 那到底什么是 `package` 呢? 阅读 [npm 的文档](https://docs.npmjs.com/getting-started/packages#what-is-a-package-), 我们会发现 `package` 准确的定义, 只要符合以下 `1` 到 `7` 其中之一条件, 就是一个 `package`

1. 一个包含了程序和描述该程序的 `package.json` 文件的文件夹, 如: `./local-module/`
2. 一个包含了 `1.` 的 gzip 压缩文件 `./module.tar.gz`
3. 一个可以下载得到 `2.` 资源的 url (通常是 http(s) url), 如: `https://registry.npmjs.org/webpack/-/webpack-4.1.0.tgz`
4. 一个格式为 `<name>@<version>` 的字符串, 可指向 npm 源 (通常是官方源 npmjs.org) 上已发布的可访问 url, 且该 url 满足条件 `3.`. 如: `webpack@4.1.0`
5. 一个格式为 `<name>@<tag>` 的字符串, 在 npm 源上该 `<tag>` 指向某 `<version>` 得到 `<name>@<version>`, 后者满足条件 `4.`, 如: `webpack@latest`
6. 一个格式为 `<name>` 的字符串, 默认添加 `latest` 标签所得到的 `<name>@latest` 满足条件 `5.`. 如: `webpack`
7. 一个 git url, 该 url 所指向的代码库满足条件 `1.`. 如: `git@github.com:webpack/webpack.git`

## 包管理

---

### 本地模块引用

---

nodejs 应用开发中不可避免有模块间调用, 例如在实践中经常会把需要被频繁引用的配置模块放到应用根目录; 于是在创建了很多层级的目录, 文件后, 很可能会遇到这样的代码:

```js
const config = require("../../../../config.js");
```

复制代码除了看上去很丑以外, 这样的路径引用也不利于代码的重构. 无需手动拷贝文件或者创建软链接到 `node_modules` 目录, npm 有更优雅的解决方案

1. 创建 `config` 包: 新增 `config` 文件夹, 重命名 `config.js` 为 `config/index.js` 文件; 创建 `package.json` 定义 `config` 包:

   ```json
   {
     "name": "config",
     "main": "index.js",
     "version": "0.1.0"
   }
   ```

2. 在应用层 `package.json` 文件中新增依赖项, 然后执行 `npm install`; 或直接执行第 3 步

   ```json
   {
     "dependencies": {
       "config": "file:./config"
     }
   }
   ```

3. 直接在应用目录执行 `npm install file:./config` (等价于第 2 步). 此时, 查看 `node_modules` 目录我们会发现多出来一个名为 `config`, 指向上层 `config/` 文件夹的软链接. 这是因为 npm 识别 `file:` 协议的 url, 得知这个包需要直接从文件系统中获取, 会自动创建软链接到 `node_modules` 中, 完成安装过程. 相比手动软链, 我们既不需要关心 windows 和 linux 命令差异, 又可以显式地将依赖信息固化到 `dependencies` 字段中, 开发团队其他成员可以执行 `npm install` 后直接使用

### 私有 git 共享 package

---

有些时候, 一个团队内会有一些代码/公用库需要在团队内不同项目间共享, 但可能不方便发布到源. 这种情况下, 我们可以简单地将被依赖的包托管在私有的 git 仓库中, 然后将该 git url 保存到 dependencies 中. npm 会直接调用系统的 git 命令从 git 仓库拉取包的内容到 `node_modules` 中, [npm 支持的 git url 格式](https://docs.npmjs.com/files/package.json#git-urls-as-dependencies):

```txt
<protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>]
```

git 路径后可以使用 `#` 指定特定的 `git branch/commit/tag`, 也可以 `#semver:` 指定特定的 semver range, 如:

```sh
git+ssh://git@github.com:npm/npm.git#v1.0.27
git+ssh://git@github.com:npm/npm#semver:^5.0
git+https://isaacs@github.com/npm/npm.git
git://github.com/npm/npm.git#v1.0.27
```

## 关键字段

---

`package.json` 官方字段可以参考: [https://docs.npmjs.com/files/package.json](https://docs.npmjs.com/files/package.json)

### 重要字段

---

1. `name`: 包名, 它有可能会作为 URL 的一部分, 命令行的参数, 目录名等等, 所以不能以点号或下划线开头; 并且它可能在 `require()` 方法中被调用, 所以应该尽可能短

2. `version`: 包的版本号

3. `description`: 包的描述, 可选字段, 必须是字符串. `npm search` 的时候会用到

4. `private`: 可选字段, 布尔值. 如果 private 为 true, npm 会拒绝发布. 这可以防止私有 repositories 不小心被发布出去

5. `publishConfig`: 可选字段, 发布时使用的配置值放这

6. `files`: 可选字段, 打包时包含的一组文件. 如果是文件夹, 文件夹下的文件也会被包含. 如果需要把某些文件不包含在项目中, 可以添加一个 `.npmignore` 文件. 这个文件和 `.gitignore` 类似

7. `main`: 可选字段, 这个字段的值是你程序主入口模块的 ID, 使用时需要指向 ES5 的代码

8. `module`: 可选字段, 与 `main` 类似, 使用时需要指向 ES6 的代码

9. `type`: 可选字段, 指定模块的加载方式, 缺少 `type` 字段, 或者包含 `"type": "commonjs"`, 则无扩展名的文件和 `.js` 结尾文件将被视为 `commonjs`, 如果值为 `module`, 则以 `.js` 结尾或没有任何扩展名的文件将作为 ES6 模块进行加载. **不管 `type` 字段的值是多少, `.mjs` 文件总是被当作 ES6 模块, 而 `.cjs` 文件总是被当作 CommonJS**

10. `bin`: 可选字段, 很多的包都会有执行文件需要安装到 PATH 中去, 这个字段对应的是一个 Map, 每个元素对应一个 `{ 命令名：文件名 }`

11. `script`: 脚本, 值是一个 json 串, key 是生命周期事件名, value 是在事件点要跑的命令

    - **`npm run` 命令执行时, 会把 `./node_modules/.bin/` 目录添加到执行环境的 PATH 变量中**, 因此如果某个命令行包未全局安装, 而只安装在了当前项目的 `node_modules` 中, 通过 npm run 一样可以调用该命令

    - 执行 npm 脚本时要传入参数, 需要在命令后加 `--` 标明, 如 `npm run test -- --grep="pattern"` 可以将 `--grep="pattern"` 参数传给 test 命令

    - npm 提供了 `pre` 和 `post` 两种钩子机制, 可以定义某个脚本前后的执行脚本

    - 运行时变量: 在 `npm run` 的脚本执行环境内, 可以通过环境变量的方式获取许多运行时相关信息, 以下都可以通过 `process.env` 对象访问获得:

      - `npm_lifecycle_event`: 正在运行的脚本名称
      - `npm_package_<key>`: 获取当前包 `package.json` 中某个字段的配置值, 如: `npm_package_name 获取包名`
      - `npm_package_<key>_<sub-key>`: `package.json` 中嵌套字段属性, 如 `npm_pacakge_dependencies_webpack` 可以获取到 `package.json` 中的 `dependencies.webpack` 字段的值, 即 webpack 的版本号

    - `script` 有默认值:

      - 如果你的包里有 `server.js`, npm 默认在 `start` 命令时, 执行：`node server.js`: `"scripts":{"start": "node server.js"}`
      - 如果包里有 `binding.gyp`, npm 默认在 `preinstall` 命令时, 使用 `node-gyp` 做编译: `"scripts":{"preinstall":"node-gyp rebuild"}`

12. `config`: 可选字段, 值是一个 json 串, config 对象中的值在 scripts 的整个周期中皆可用, 专门用于给 scripts 提供配置参数

13. `dependencies`: 可选字段, 指示当前包所依赖的其他包

14. `devDependencies`: 可选字段, 如果只需要下载使用某些模块, 而不下载这些模块的测试和文档框架, 放在这个下面比较不错

15. `peerDependencies`: 可选字段, 兼容性依赖, 如果你的包是插件, 适合这种方式

16. `bundledDependencies`: 可选字段, 发布包时将这个字段下的依赖也打包进去

17. `optionalDependencies`: 可选字段, 如果你想在某些依赖即使没有找到, 或者安装失败的情况下, npm 都继续执行, 那么这些依赖适合放在这里

### 其它字段

---

1. `keywords`: 可选字段, 字符串数组. `npm search` 的时候会用到

2. `homepage`: 可选字段, 值是不带 `http://` 等带协议前缀的 URL

3. `bugs`: 可选字段, 问题追踪系统的 URL 或邮箱地址, `npm bugs` 会用到:

   ```json
   {
     "url": "http://github.com/owner/project/issues",
     "email": "project@hostname.com"
   }
   ```

4. `license`: 可选字段, 包的许可证

5. `author`, `contributors`: 都是可选字段. `author` 是一个人, `contributors`是一组人.

   - `author` 的格式如下:

     ```json
     {
       "name": "Barney Rubble",
       "email": "b@rubble.com",
       "url": "http://barnyrubble.tumblr.com/"
     }
     ```

   - 这种格式也可以: `"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"`

6. `man`: 指定一个单一的文件或者一个文件数组供 man 程序使用

7. `directories`: 用于指示包的目录结构

   - `directories.lib`: 指示库文件的位置
   - `directories.bin`: 和前面的 bin 是一样的, 但如果前面已经有 bin, 那么这个就无效

   - 除了以上两个, 还有 `directories.doc`, `directories.man`, `directories.example`

8. `repository`: 可选字段, 用于指示代码存放的位置

   ```json
   "repository": {
     "type" : "git",
     "url" : "http://github.com/npm/npm.git"
   }
   ```

9. `engines`: 可选字段, 既可以指定 node 版本, 也可以指定 npm 版本:

   ```json
   {
     "engines": {
       "node": ">=0.10.3 <0.12",
       "npm": "~1.0.20"
     }
   }
   ```

10. `engineStrick`: 可选字段, 布尔值. 如果你肯定你的程序只能在制定的 engine 上运行, 设置为 true。

11. `os`: 可选字段, 指定模块可以在什么操作系统上运行:

    ```json
    "os" : [ "darwin", "linux", "!win32" ]
    ```

12. `cpu`: 可选字段, 指定 CPU 型号:

    ```json
    "cpu" : [ "x64", "ia32", "!arm","!mips" ]
    ```

13. `preferGlobal`: 可选字段, 布尔值. 如果你的包是个命令行应用程序需要全局安装, 就可以设为 true

### 非官方字段

---

1. yarn 相关字段:

   - `flat`: 布尔值, 如果你的包只允许给定依赖的一个版本, 你想强制和命令行上 yarn install --flat 相同的行为, 把这个值设为 true。
   - `resolutions`: 允许你覆盖特定嵌套依赖项的版本. 有关完整规范, 请参见 [选择性版本解析 RFC](https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md)

2. unpkg 相关字段 (unpkg 让 npm 上所有的文件都开启 cdn 服务):

   - `unpkg`: 以 `jquery` 为例, `"unpkg": "dist/jquery.js"`, 正常情况下访问 jquery 的发布文件通过 `https://unpkg.com/jquery@3.3.1/dist/jquery.js`, 当你使用省略的 url `https://unpkg.com/jquery` 时, 便会按照如下的方式获取文件：

   ```ini
   # [latestVersion] 指最新版本号，pkg 指 package.json
   # 定义了 unpkg 属性时
   https://unpkg.com/jquery@[latestVersion]/[pkg.unpkg]
   # 未定义 unpkg 属性时，将回退到 main 属性
   https://unpkg.com/jquery@[latestVersion]/[pkg.main]
   ```

3. TypeScript 相关字段:

   - `types`, `typings`: 指定 TypeScript 的类型定义文件。

4. browserslist 相关字段:

   - `browserslist`: 设置项目的浏览器兼容情况

5. 发行打包相关字段:

   - `module`: (ES6 后成为官方字段) 定义一个针对 es6 模块及语法的入口文件
   - `browser`: 指定该模块供浏览器使用的入口文件, 如果这个字段未定义则回退到 `main` 字段指向的文件, `rollup`, `webpack`, `browserify` 均支持该配置
   - `esnext`: 使用 es 模块化规范, stage 4 特性的源代码

     ```json
     {
       "main": "main.js",
       "esnext": "main-esnext.js"
     }
     # or
     {
       "main": "main.js",
       "esnext": {
         "main": "main-esnext.js",
         "browser": "browser-specific-main-esnext.js"
       }
     }
     ```

   - `es2015`: Angular 定义的未转码的 es6 源码

6. react-native 相关字段:

   - react-native: 指定该模块供 `react-native` 使用的入口文件, 如果这个字段未定义, 则回退到 main 字段指向的文件

7. webpack 相关字段:

   - `sideEffects`: 声明该模块是否包含 sideEffects (副作用), 从而可以为 tree-shaking 提供更大的优化空间

8. nyc: istanbul.js 命令行, 详细参考 [nyc docs](https://github.com/istanbuljs/nyc#use-with-babel-plugin-istanbul-for-babel-support)

   ```json
   {
     "nyc": {
       "extension": [".js", ".mjs"],
       "require": ["@std/esm"]
     }
   }
   ```
