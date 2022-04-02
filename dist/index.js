'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var child_process = require('child_process');
var path = require('path');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespace(fs);
var child_process__namespace = /*#__PURE__*/_interopNamespace(child_process);
var path__namespace = /*#__PURE__*/_interopNamespace(path);

const stdin = process.stdin;
const stdout$1 = process.stdout;
exports.Colors = void 0;
(function (Colors) {
    Colors[Colors["black"] = 0] = "black";
    Colors[Colors["red"] = 1] = "red";
    Colors[Colors["green"] = 2] = "green";
    Colors[Colors["yellow"] = 3] = "yellow";
    Colors[Colors["blue"] = 4] = "blue";
    Colors[Colors["magenta"] = 5] = "magenta";
    Colors[Colors["cyan"] = 6] = "cyan";
    Colors[Colors["white"] = 7] = "white";
})(exports.Colors || (exports.Colors = {}));
function style(color, data, light = false) {
    return `\x1b[${light ? color + 90 : color + 30}m${data}\x1b[0m`;
}
function question(questionStr) {
    return new Promise((res, rej) => {
        stdout$1.write(questionStr);
        stdin.once('data', data => res(String(data).trim()));
        stdin.once('error', er => rej(er));
        stdin.resume();
    });
}
function closeStdin() {
    stdin.destroy();
}
class List {
    constructor() {
        this._title = '';
        this._footer = '';
        this.listData = [];
        this.listTileBuilder = li => ` o ${li}\n`;
    }
    /**@override */
    onFocus(data, index, list) { }
    ;
    clearList() {
        stdout$1.cursorTo(0);
        stdout$1.moveCursor(0, -(this.listData.length + 4));
        stdout$1.clearScreenDown();
    }
    buildList() {
        stdout$1.write(`${this.title}\n\n`);
        this.listData.forEach((li, i) => {
            stdout$1.write(this.listTileBuilder(li));
        });
        stdout$1.write(`\n${this.footer}`);
    }
    rebuild() {
        this.clearList();
        this.buildList();
    }
    get title() {
        return this._title;
    }
    set title(v) {
        this._title = v;
        this.rebuild();
    }
    get footer() {
        return this._footer;
    }
    set footer(v) {
        this._footer = v;
        this.rebuild();
    }
    setListData(listData) {
        let _build = this.listData.length ? this.rebuild : this.buildList;
        this.listData = listData;
        _build.call(this);
    }
    static builder(listData, listTileBuilder) {
        let list = new List();
        list.listTileBuilder = listTileBuilder;
        list.setListData(listData);
        return list;
    }
}
class MultiSelectionList extends List {
    constructor() {
        super(...arguments);
        this.selected = new Set();
        /**@override */
        this.listTileBuilder = (li, focus) => focus ? style(exports.Colors.yellow, `-> ${li}\n`, true) : `   ${li}\n`;
    }
    focus(index = 0) {
        if (this.selected.has(index))
            this.selected.delete(index);
        else
            this.selected.add(index);
        this.rebuild();
        this.onFocus(this.listData[index], index, this.listData);
    }
    buildList() {
        stdout$1.write(`${this.title}\n\n`);
        this.listData.forEach((li, i) => {
            stdout$1.write(this.listTileBuilder(li, this.selected.has(i)));
        });
        stdout$1.write(`\n${this.footer}`);
    }
}
class RadioList extends List {
    constructor() {
        super(...arguments);
        this.selected = 0;
        /**@override */
        this.listTileBuilder = (li, focus) => focus ? style(exports.Colors.yellow, `-> ${li}\n`, true) : `   ${li}\n`;
    }
    focus(index = 0) {
        this.selected = index;
        this.rebuild();
        this.onFocus(this.listData[index], index, this.listData);
    }
    buildList() {
        stdout$1.write(`${this.title}\n\n`);
        this.listData.forEach((li, i) => {
            stdout$1.write(this.listTileBuilder(li, this.selected === i));
        });
        stdout$1.write(`\n${this.footer}`);
    }
}
function selectionList(arr, hint = `Use ${style(exports.Colors.cyan, 'Arrow Up/Down')} to move cursor & ${style(exports.Colors.cyan, 'Enter')} to select`) {
    let selected = 0;
    stdout$1.write(`\n${hint}\n\n`);
    const clearList = () => {
        stdout$1.cursorTo(0);
        stdout$1.moveCursor(0, -arr.length);
        stdout$1.clearScreenDown();
    };
    const buildList = () => {
        arr.forEach((li, i) => {
            stdout$1.write(selected === i ?
                `${style(exports.Colors.yellow, '-> ' + li, true)}\n` : `   ${li}\n`);
        });
    };
    buildList();
    stdin.setRawMode(true);
    return new Promise((resolve) => {
        const onData = (rawData) => {
            clearList();
            const data = rawData.slice(0).join(',');
            if (data === '3')
                closeStdin();
            if (data === '27,91,65') {
                //Arrow Up
                selected = !selected ? arr.length - 1 : selected - 1;
            }
            if (data === '27,91,66') {
                //Arrow Down
                selected = selected === arr.length - 1 ? 0 : selected + 1;
            }
            if (data === '13') {
                //Enter
                stdin.setRawMode(false);
                stdin.off('data', onData);
                resolve(selected);
            }
            buildList();
        };
        stdin.on('data', onData);
    });
}

class Template {
    constructor(str) {
        this.rawString = '';
        this.rawString = str;
    }
    gatherDependencies() {
        let regExp = /\[\[[\s]*([_a-zA-Z][\w]*?)[\s]*\]\]/g;
        let resArr;
        let ids = [];
        while (resArr = regExp.exec(this.rawString)) {
            ids.push({
                expr: resArr[1],
                index: resArr.index
            });
        }
        return ids;
    }
    getTemplateData() {
        const rawString = this.rawString;
        const deps = this.gatherDependencies();
        const templateStringArray = [];
        const identifiers = [];
        let lastIndex = 0;
        for (const t of deps) {
            const { expr, index } = t;
            templateStringArray.push(rawString.slice(lastIndex, lastIndex = index));
            identifiers.push(expr);
            lastIndex += expr.length + 4;
        }
        templateStringArray.push(rawString.slice(lastIndex));
        return { templateStringArray, identifiers };
    }
}
class TemplateCompiler {
    constructor(templateData) {
        this.templateData = templateData;
    }
    async compile(data) {
        const { templateStringArray, identifiers } = this.templateData;
        const propNamesInNeed = [];
        for (const id of identifiers) {
            if (id in data)
                continue;
            propNamesInNeed.push(id);
        }
        if (propNamesInNeed.length) {
            let obj = await this.onPropsInNeed(propNamesInNeed);
            data = Object.assign(data, obj);
        }
        return templateStringArray.reduce((pre, cur, i) => {
            const curStr = cur + (data[identifiers[i]] || '');
            return pre + curStr;
        }, '');
    }
    /**@override */
    async onPropsInNeed(propNames) {
        let obj = {};
        for (const name of propNames) {
            obj[name] = await question(`Input a value for ${style(exports.Colors.cyan, name, true)}: `);
        }
        return obj;
    }
}
async function compileTemplateString(templateString, compileData, onPropsInNeed) {
    const td = new Template(templateString);
    let compiler = new TemplateCompiler(td.getTemplateData());
    if (typeof onPropsInNeed === 'function') {
        compiler.onPropsInNeed = (propNames) => onPropsInNeed.call(compiler, propNames);
    }
    return await compiler.compile(compileData);
}
async function compileTemplateFile(src, compileData, onPropsInNeed) {
    const dataString = String(fs__namespace.readFileSync(src));
    return await compileTemplateString(dataString, compileData, onPropsInNeed);
}

class FileLike {
    constructor(src, fileName) {
        this.src = src;
        this.fileName = fileName;
        try {
            const stat = fs__namespace.statSync(src);
            this.type = stat.isFile() ? 'file' :
                stat.isDirectory() ? 'dir' : 'unknown';
        }
        catch (error) {
            this.type = 'unknown';
        }
        this.findFiles();
    }
    findFiles() {
        if (this.type !== 'dir')
            return;
        this.childFiles = [];
        fs__namespace.readdirSync(this.src).forEach((file) => {
            this.childFiles.push(new FileLike(path__namespace.resolve(this.src, file), file));
        });
        return true;
    }
    toJsonStr() {
        return JSON.stringify(this);
    }
    purify() {
        return JSON.parse(this.toJsonStr());
    }
}

const stdout = process.stdout;
class Generator {
    constructor(source, target) {
        this.includes = [];
        this.excludes = [];
        this.templates = [];
        this.source = source;
        this.target = target;
    }
    async prompt(questionStr, hint) {
        return await question(style(exports.Colors.white, questionStr) +
            (hint ? style(exports.Colors.black, ` (${hint}): `, true) : ''));
    }
    say(msg, color = exports.Colors.white) {
        stdout.write(style(color, msg) + '\n');
    }
    include(...includes) {
        this.includes.push(...includes);
        return this;
    }
    exclude(...excludes) {
        this.excludes.push(...excludes);
        return this;
    }
    template(...templates) {
        this.templates.push(...templates);
        return this;
    }
    installDependencies() {
        this.say('Installing dependencies...', exports.Colors.cyan);
        child_process__namespace.exec('npm i', (err, out) => {
            if (err) {
                this.say('Installation failed.\n' + err.stack, exports.Colors.red);
                return;
            }
            this.say(out);
            this.say('Installation finished.', exports.Colors.cyan);
        });
    }
    async generate(obj) {
        let excludes = this.excludes.reduce((pre, cur) => {
            return [...pre, new RegExp(cur)];
        }, []);
        let fileSplitted = this.source.split(/[\/\\]/g);
        let file = new FileLike(this.source, fileSplitted[fileSplitted.length - 1]);
        await this.genList(file.childFiles, excludes, obj);
        closeStdin();
    }
    async genList(list, excludes, data) {
        let targetDir = this.target;
        let sourceDir = this.source;
        forloop: for (const file of list) {
            const { src, childFiles, type } = file;
            let targetUri = src.replace(sourceDir, targetDir);
            if (type === 'unknown')
                continue;
            if (type === 'dir') {
                if (!fs__namespace.existsSync(targetUri))
                    fs__namespace.mkdirSync(targetUri);
                await this.genList(childFiles, excludes, data);
                continue;
            }
            //excludes
            for (const regExp of excludes) {
                if (regExp.test(src))
                    continue forloop;
            }
            let dataStr = String(fs__namespace.readFileSync(src));
            //template
            for (const t of this.templates) {
                if (src.endsWith(t))
                    dataStr = await compileTemplateString(dataStr, data, this.onPrompt);
            }
            fs__namespace.writeFileSync(targetUri, dataStr);
        }
    }
}

exports.Generator = Generator;
exports.List = List;
exports.MultiSelectionList = MultiSelectionList;
exports.RadioList = RadioList;
exports.Template = Template;
exports.TemplateCompiler = TemplateCompiler;
exports.closeStdin = closeStdin;
exports.compileTemplateFile = compileTemplateFile;
exports.compileTemplateString = compileTemplateString;
exports.question = question;
exports.selectionList = selectionList;
exports.style = style;
