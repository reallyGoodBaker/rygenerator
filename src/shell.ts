import { Colors, closeStdin, question, selectionList, style } from './interact'
import { compileTemplateString } from './template'
const stdout = process.stdout
import * as child_process from 'child_process'
import { FileLike } from './flike'
import * as fs from 'fs'

export class Generator {
    private source: string;
    private target: string;
    private includes: string[] = [];
    private excludes: string[] = [];
    private templates: string[] = [];


    async prompt(questionStr: string, hint?: string) {
        return await question(
            style(Colors.white, questionStr) +
            (hint ? style(Colors.black, ` (${hint}): `, true) : '')
        )
    }

    say(msg: string, color: Colors = Colors.white) {
        stdout.write(style(color, msg) + '\n');
    }

    include(...includes: string[]) {
        this.includes.push(...includes);
        return this;
    }

    exclude(...excludes: string[]) {
        this.excludes.push(...excludes);
        return this;
    }

    template(...templates: string[]) {
        this.templates.push(...templates);
        return this;
    }

    installDependencies() {
        this.say(
            'Installing dependencies...',
            Colors.cyan
        );
        child_process.exec('npm i', (err, out) => {
            if (err) {
                this.say(
                    'Installation failed.\n' + err.stack,
                    Colors.red
                )
                return;
            }
            this.say(out);
            this.say(
                'Installation finished.',
                Colors.cyan
            )
        })
    }

    async generate(obj: any) {
        let excludes = this.excludes.reduce((pre, cur) => {
            return [...pre, new RegExp(cur)]
        }, [])
        let fileSplitted = this.source.split(/[\/\\]/g)
        let file = new FileLike(this.source, fileSplitted[fileSplitted.length - 1])

        await this.genList(file.childFiles, excludes, obj)
        closeStdin()
    }

    private async genList(list: FileLike[], excludes: RegExp[], data: any) {
        let targetDir = this.target
        let sourceDir = this.source
        forloop: for (const file of list) {

            const { src, childFiles, type } = file
            let targetUri = src.replace(sourceDir, targetDir)
            if (type === 'unknown') continue
            if (type === 'dir') {
                if(!fs.existsSync(targetUri)) fs.mkdirSync(targetUri)
                await this.genList(childFiles, excludes, data)
                continue
            }
            //excludes
            for (const regExp of excludes) {
                if (regExp.test(src)) continue forloop
            }
            
            let dataStr = String(fs.readFileSync(src))
            //template
            for (const t of this.templates) {
                if (src.endsWith(t)) dataStr = await compileTemplateString(dataStr, data, this.onPrompt)
            }

            fs.writeFileSync(targetUri, dataStr)

        }
    }

    /**@override */
    onPrompt: (propNames: string[]) => Promise<any>


    constructor(source: string, target: string) {
        this.source = source
        this.target = target
    }
}