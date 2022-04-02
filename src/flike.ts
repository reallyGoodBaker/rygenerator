import * as fs from 'fs';
import * as path from 'path';

export class FileLike {
    type: 'file' | 'dir' | 'unknown';
    src: string;
    childFiles: FileLike[];
    fileName: string;

    constructor(src: string, fileName: string) {
        this.src = src;
        this.fileName = fileName;
        try {
            const stat = fs.statSync(src);
            this.type = stat.isFile()? 'file':
                stat.isDirectory()? 'dir': 'unknown';
        } catch (error) {
            this.type = 'unknown';
        }

        this.findFiles();
    }

    private findFiles() {
        if(this.type !== 'dir') return;
        this.childFiles = [];
        
        fs.readdirSync(this.src).forEach((file: string) => {
            this.childFiles.push(new FileLike(path.resolve(this.src, file), file));
        })
        return true;
    }

    toJsonStr() {
        return JSON.stringify(this);
    }

    purify() {
        return JSON.parse(this.toJsonStr());
    }
}
