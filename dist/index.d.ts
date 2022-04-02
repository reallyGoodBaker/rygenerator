export var compileTemplateString: {
    (
        templateString: string,
        compileData: any,
        onPropsInNeed?: (propNames: string[]) => Promise<any>
    ): Promise<string>
};

export var closeStdin: {
    (): void;
}

export var question: {
    (questionStr: string): Promise<string>
}

export var selectionList: {
    (arr: string[], hint?: string): Promise<number>
}

export enum Colors {
    black, red, green, yellow,
    blue, magenta, cyan, white
}

export var style: {
    (color: Colors, data: string, light?: boolean): string
}

export class Generator {
    prompt(questionStr: string, hint?: string): Promise<string>;
    say(msg: string, color?: Colors): void;
    include(...includes: string[]): Generator;
    exclude(...excludes: string[]): Generator;
    template(...templates: string[]): Generator;
    installDependencies(): void;
    generate(obj: any): Promise<any>;
    constructor(source: string, target: string);
}