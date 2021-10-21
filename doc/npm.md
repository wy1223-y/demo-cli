# npm

---

## npm install

---

假设项目 App 中有如下三个依赖:

```json
"dependencies": {
    A: "1.0.0",
    B: "1.0.0",
    C: "1.0.0"
}
```

A, B, C 三个模块又有如下依赖:

```txt
A@1.0.0 -> D@1.0.0
B@1.0.0 -> D@2.0.0
C@1.0.0 -> D@1.0.0
```

### npm 2.x - 嵌套结构

---

npm 2.x 安装依赖方式比较简单直接: **以递归的方式按照包依赖的树形结构下载填充本地目录结构, 也就是说每个包都会将该包的依赖安装到当前包所在的 `node_modules` 目录中**

执行 npm install 后, 项目 App 的 `node_modules` 会变成如下目录结构:

```txt
├── node_modules
│   ├── A@1.0.0
│   │   └── node_modules
│   │   │   └── D@1.0.0
│   ├── B@1.0.0
│   │   └── node_modules
│   │   │   └── D@2.0.0
│   └── C@1.0.0
│   │   └── node_modules
│   │   │   └── D@1.0.0
```

### npm 3.x - 扁平结构

---

npm 3.x 则采用了扁平化的结构来安装组织 `node_modules`, 也就是 **在执行 npm install 的时候, 按照 `package.json` 里依赖的顺序依次解析, 遇到新的包就把它安装在第一级目录, 后续安装如果遇到一级目录已经存在的包, 会先按照约定版本判断版本, 如果符合版本约定则忽略, 否则会按照 npm 2.x 的方式依次挂在依赖包目录下**

在 npm 3.x 环境下, 执行 npm install 后, `node_modules` 会变成如下目录结构:

```txt
├── node_modules
│   ├── A@1.0.0
│   ├── D@1.0.0
│   ├── B@1.0.0
│   │   └── node_modules
│   │   │   └── D@2.0.0
│   └── C@1.0.0
```

**模块的安装次序决定了 `node_modules` 中的目录结构, npm 会优先将模块安装在根目录下的 `node_modules` 中**, 再在项目中安装 `模块E@1.0.0` (依赖于 `模块D@2.0.0`), 目录结构变为:

```txt
├── node_modules
│   ├── A@1.0.0
│   ├── D@1.0.0
│   ├── B@1.0.0
│   │   └── node_modules
│   │   │   └── D@2.0.0
│   └── C@1.0.0
│   ├── E@1.0.0
│   │   └── node_modules
│   │   │   └── D@2.0.0
```

B、E 模块下都包含了依赖的 `模块D@2.0.0`, 存在代码冗余的情况, 再在项目中安装 `模块F@1.0.0` (依赖于 `模块D@1.0.0`). 由于 `D@1.0.0` 已经存在于项目根目录下的 `node_modules` 下, 所以在安装 F 模块的时候无需再在其依赖包中安装 `D@1.0.0` 模块, 目录结构变为:

```txt
├── node_modules
│   ├── A@1.0.0
│   ├── D@1.0.0
│   ├── B@1.0.0
│   │   └── node_modules
│   │   │   └── D@2.0.0
│   └── C@1.0.0
│   ├── E@1.0.0
│   │   └── node_modules
│   │   │   └── D@2.0.0
│   └── F@1.0.0
```

从以上结构可以看出: **npm 3.x 并没有完美的解决 npm 2.x 中的问题, 甚至还会退化到 npm 2.x 的行为**. 为了解决目录中存在很多副本的情况, (在 A, C 模块的依赖模块 D 升级到 2.0.0 前提下) 可以通过 `npm dedupe` 指令把所有二级的依赖 `模块D@2.0.0` 重定向到一级目录下:

```txt
├── node_modules
│   ├── A@1.0.0
│   ├── D@2.0.0
│   ├── B@1.0.0
│   └── C@1.0.0
│   ├── E@1.0.0
│   └── F@1.0.0
```

`node_modules` 路径查找机制: **模块再找对应的依赖包时, nodejs 会尝试从当前模块所在目录开始, 尝试在它的 `node_modules` 文件夹里加载相应模块, 如果没有找到那么就再向上一级目录移动, 直到全局安装路径中的 `node_modules` 为止**. 很明显在 npm 3 之后 npm 的依赖树结构不再与文件夹层级一一对应了. 想要查看 app 的直接依赖项, 要通过 `npm ls` 命令指定 `--depth` 参数来查看:

```sh
npm ls --depth 1
```

### npm 5.x - package-lock.json

---

从 npm 5.x 开始, 安装组织 `node_modules` 和 npm 3.x 一样采用了扁平化的方式, 最大的变化是增加了 `package-lock.json` 文件. 在 5.0 ~ 5.6 中间对 `package-lock.json` 的处理逻辑更新过几个版本, 5.6 以上才开始稳定. 因此 npm 版本最好在 5.6 以上

npm 为了让开发者在安全的前提下使用最新的依赖包， 在 `package.json` 中通常做了锁定大版本的操作, 这样在每次 npm install 的时候都会拉取依赖包大版本下的最新的版本. 这种机制最大的一个缺点就是当有依赖包有小版本更新时, 可能会出现协同开发者的依赖包不一致的问题. **`package-lock.json` 文件精确描述了 `node_modules` 目录下所有的包的树状依赖结构**, 每个包的版本号都是完全精确的.

**`package-lock.json` 文件的作用**:

- 在团队开发中确保每个团队成员安装的依赖版本是一致的, 确定一棵唯一的 `node_modules` 树
- `node_modules` 目录本身是不会被提交到代码库的, 但是 `package-lock.json` 可以提交到代码库, 如果开发人员想要回溯到某一天的目录状态, 只需要把 `package.json` 和 `package-lock.json`  这两个文件回退到那一天即可
- 由于 `package-lock.json` 和 `node_modules` 中的依赖嵌套完全一致, 可以更加清楚的了解树的结构及其变化
- 在安装时, **npm 会比较 `node_modules` 已有的包, 和 `package-lock.json` 进行比较, 如果重复的话就跳过安装**, 从而优化了安装的过程

以 `sass-loader` 在 `package-lock.json` 中为例:

```json
"dependencies": {
  "sass-loader": {
    "version": "7.1.0",
    "resolved": "http://registry.npm.taobao.org/sass-loader/download/sass-loader-7.1.0.tgz",
    "integrity": "sha1-Fv1ROMuLQkv4p1lSihly1yqtBp0=",
    "dev": true,
    "requires": {
      "clone-deep": "^2.0.1",
      "loader-utils": "^1.0.1",
      "lodash.tail": "^4.1.1",
      "neo-async": "^2.5.0",
      "pify": "^3.0.0",
      "semver": "^5.5.0"
    },
    "dependencies": {
      "pify": {
        "version": "3.0.0",
        "resolved": "http://registry.npm.taobao.org/pify/download/pify-3.0.0.tgz",
        "integrity": "sha1-5aSs0sEB/fPZpNB/DbxNtJ3SgXY=",
        "dev": true
      }
    }
  }
}
```

`package-lock.json` 的详细描述主要由 `version`, `resolved`, `integrity`, `dev`, `requires`, `dependencies` 这几个字段构成:

- `version`: 包唯一的版本号
- `resolved`: 安装源
- `integrity`: 表明包完整性的 hash 值 (验证包是否已失效)
- `dev`: 如果为 true, 则此依赖关系仅是顶级模块的开发依赖关系或者是一个的传递依赖关系
- `requires`: 依赖包所需要的所有依赖项, 对应依赖包 `package.json` 里 `dependencies` 中的依赖项
- `dependencies`: 依赖包 `node_modules` 中依赖的包, 与顶层的 `dependencies` 一样的结构

在上面的 `package-lock.json` 文件中可以发现, 在 `requires` 和 `dependencies` 中都存在 pify 依赖项. 去 `node_modules` 里面探下究竟:

打开根目录的 `node_modules` 会发现安装了 sass-loader 所需要的所有依赖包, 这些依赖包中除了 pify 以外所有依赖包的大版本号都与 sass-loader 所需要的一致.到根目录的 `node_modules` 找到 pify 依赖包发现版本为 `4.0.1`. 找到 sass-loader 项目依赖包, 打开其 `node_modules` 发现其中也存在个 pify 依赖包, 但版本为 3.0.0. 这个版本的 sass-loader 真正依赖的是这个版本的 pify.

通过以上几个步骤, 说明 `package-lock.json` 文件和 `node_modules` 目录结构是一一对应的, 即项目目录下存在 `package-lock.json` 可以让每次安装生成的依赖目录结构保持相同.

**在开发一个应用时, 建议把 `package-lock.json` 文件提交到代码版本仓库, 从而让你的团队成员, 运维部署人员或 CI 系统可以在执行 npm install 时安装的依赖版本都是一致的**. 但是 **在开发一个库时, 则不应把 `package-lock.json` 文件发布到仓库中**. 实际上 npm 也默认不会把 `package-lock.json` 文件发布出去. 之所以这么做, 是因为库项目一般是被其他项目依赖的, 在不写死的情况下就可以复用主项目已经加载过的包, 而一旦库依赖的是精确的版本号那么可能会造成包的冗余

依然有反对的声音认为 `package-lock` 太复杂, 对此 npm 也提供了禁用配置:

```sh
npm config set package-lock false
```
