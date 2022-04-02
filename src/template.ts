type Expr = {
    expr: string;
    index: number;
}
type TemplateData = {
    templateStringArray: string[];
    identifiers: string[];
}

export class Template {
    private rawString = '';

    constructor(str: string) {
        this.rawString = str;
    }

    gatherDependencies() {
        let regExp = /\[\[[\s]*([_a-zA-Z][\w]*?)[\s]*\]\]/g;
        let resArr: RegExpExecArray;
        let ids: Expr[] = [];

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
        const templateStringArray: string[] = [];
        const identifiers: string[] = [];
        let lastIndex = 0;

        for (const t of deps) {
            const {expr, index} = t;

            templateStringArray.push(
                rawString.slice(lastIndex, lastIndex = index)
            );

            identifiers.push(expr);
            lastIndex += expr.length + 4;
        }

        templateStringArray.push(rawString.slice(lastIndex));


        return {templateStringArray, identifiers};
    }

}


import {Colors, question, style} from './interact'

export class TemplateCompiler {
    private templateData: TemplateData;

    constructor(templateData: TemplateData) {
        this.templateData = templateData;
    }

    async compile(data: any) {
        const {templateStringArray, identifiers} = this.templateData;
        const propNamesInNeed: string[] = [];

        for (const id of identifiers) {
            if (id in data) continue;
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
    async onPropsInNeed(propNames: string[]):  Promise<object>{
        let obj = {};
        for (const name of propNames) {
            obj[name] = await question(`Input a value for ${style(Colors.cyan, name, true)}: `);
        }
        return obj;
    }


}

export async function compileTemplateString(
    templateString: string,
    compileData: any,
    onPropsInNeed?: (propNames: string[]) => Promise<any>
) {
    const td = new Template(templateString);
    let compiler = new TemplateCompiler(td.getTemplateData());
    if(typeof onPropsInNeed === 'function') {
        compiler.onPropsInNeed = (propNames: string[]) => onPropsInNeed.call(compiler, propNames);
    }
    return await compiler.compile(compileData);
}

import * as fs from 'fs';

export async function compileTemplateFile(
    src: string,
    compileData: any,
    onPropsInNeed?: (propNames: string[]) => Promise<any>
) {
    const dataString = String(fs.readFileSync(src));
    return await compileTemplateString(dataString, compileData, onPropsInNeed);
}