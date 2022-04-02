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





## APIs

所有api通过引入 `reallygoodbaker-generator` 获得

### closeStdin

```ts
function closeStdin(): void
```

关闭输入流



### question

```ts
function question(questionStr: string): Promise<string>
```

向控制台输出 questionStr , 并返回用户输入的串



### Colors

```ts
enum Colors {
    black, red, green, yellow,
    blue, magenta, cyan, white
}
```

颜色的枚举值



### style

```ts
function style(color: Colors, data: string, light?: boolean): string
```

返回具有特殊样式的字符串

`color`  颜色

`data`   需要上色的字符串

`light` 	使用亮色



### Generator



#### `constructor`

```ts
constructor(source: string, target: string)
```

`source`	脚手架的路径

`target`	目标文件夹的路径



#### prompt

```ts
prompt(questionStr: string, hint?: string): Promise<string>
```



#### say

```ts
function say(msg: string, color?: Colors): void
```



#### template

```ts
function template(...templates: string[]): Generator
```



#### exclude

```ts
function exclude(...excludes: string[]): Generator
```



#### installDependencies

```ts
function installDependencies(): void
```



#### generate

```ts
function generate(obj: any): Promise<any>
```



