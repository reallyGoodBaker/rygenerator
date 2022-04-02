# rygenerator

低仿 `yeoman` 



## 快速上手

```sh
npm i reallygoodbaker-generator -g
```

安装完成后你可以使用 `rygen` 生成项目.



你也可以做自己的生成器：

```sh
npm i rygenerator-rygenerator -g
```

安装完成后，在你想要生成的位置运行：

```sh
rygen rygenerator
```

此时程序会询问您是否在创建完成后安装依赖，请您根据您的想法自行安排



安装完成后，若你安装了依赖，文件目录就会是这样：

```bash
│  index.js
│  package-lock.json
│  package.json
│
├─node_modules
│
└─template
```

没安装依赖只会少 `package-lock.json`



### index.js

```js
const {Generator, closeStdin} = require('reallygoodbaker-generator')

module.exports = async function(source, target) {
    await main(new Generator(source, target));
    
    closeStdin();
}

async function main(generator) {
    //Your code here
}
```





## API

