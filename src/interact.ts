const stdin = process.stdin;
const stdout = process.stdout;

import {Colors, message} from 'styled-message'

export {Colors} from 'styled-message'

export function style(color: Colors, data: string, light = false) {
    return message(data).color(color, light).toString()
}

export function question(questionStr: string): Promise<string> {
    return new Promise((res, rej) => {
        stdout.write(questionStr);
        stdin.once('data', data => res(String(data).trim()));
        stdin.once('error', er => rej(er));
        stdin.resume();
    })
}

export function closeStdin() {
    stdin.destroy();
}

export class List {

    private _title = '';
    private _footer = '';
    protected listData: any[] = [];

    /**@override */
    protected onFocus(data: any, index: number, list: any[]): void { };

    protected listTileBuilder: (li: string) => string
        = li => ` o ${li}\n`;

    protected clearList() {
        stdout.cursorTo(0);
        stdout.moveCursor(0, -(this.listData.length + 4));
        stdout.clearScreenDown();
    }

    protected buildList() {
        stdout.write(`${this.title}\n\n`);

        this.listData.forEach((li, i) => {
            stdout.write(this.listTileBuilder(li))
        })

        stdout.write(`\n${this.footer}`);
    }

    protected rebuild() {
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

    setListData(listData: any[]) {
        let _build = this.listData.length? this.rebuild: this.buildList;
        this.listData = listData;
        _build.call(this);
    }

    static builder(listData: any[], listTileBuilder: (li: string) => string) {
        let list = new List();
        list.listTileBuilder = listTileBuilder;
        list.setListData(listData);
        return list;
    }
}

export class MultiSelectionList extends List {
    private selected = new Set<number>();

    /**@override */
    protected listTileBuilder: (li: string, focus?: boolean) => string
        = (li, focus) => focus ? style(Colors.yellow, `-> ${li}\n`, true) : `   ${li}\n`;

    focus(index = 0) {
        if (this.selected.has(index)) this.selected.delete(index);
        else this.selected.add(index);
        this.rebuild();
        this.onFocus(this.listData[index], index, this.listData);
    }

    protected buildList() {
        stdout.write(`${this.title}\n\n`);

        this.listData.forEach((li, i) => {
            stdout.write(this.listTileBuilder(li, this.selected.has(i)))
        })

        stdout.write(`\n${this.footer}`);
    }
}

export class RadioList extends List {
    private selected = 0;

    /**@override */
    protected listTileBuilder: (li: string, focus?: boolean) => string
        = (li, focus) => focus ? style(Colors.yellow, `-> ${li}\n`, true) : `   ${li}\n`;

    focus(index = 0) {
        this.selected = index;
        this.rebuild();
        this.onFocus(this.listData[index], index, this.listData);
    }

    protected buildList() {
        stdout.write(`${this.title}\n\n`);

        this.listData.forEach((li, i) => {
            stdout.write(this.listTileBuilder(li, this.selected === i))
        })

        stdout.write(`\n${this.footer}`);
    }
}

export function selectionList(arr: string[], hint = `Use ${style(Colors.cyan, 'Arrow Up/Down')} to move cursor & ${style(Colors.cyan, 'Enter')} to select`) {
    let selected = 0;
    stdout.write(`\n${hint}\n\n`);

    const clearList = () => {
        stdout.cursorTo(0);
        stdout.moveCursor(0, -arr.length);
        stdout.clearScreenDown();
    }

    const buildList = () => {
        arr.forEach((li, i) => {
            stdout.write(
                selected === i ?
                    `${style(Colors.yellow, '-> ' + li, true)}\n` : `   ${li}\n`
            )
        })
    }
    buildList();

    stdin.setRawMode(true);

    return new Promise((resolve) => {
        const onData = (rawData: Buffer) => {
            clearList();
            const data = rawData.slice(0).join(',');
            if (data === '3') closeStdin();
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
        }

        stdin.on('data', onData);
    })
}
