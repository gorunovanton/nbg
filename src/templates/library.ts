import * as path from 'path'

interface ILibrary {
    new(libraryPath: string): any

    hello(): void

    getFive(): number
}

interface IAddon {
    Library: ILibrary
}

export class Library {
    private readonly addon: IAddon;
    private readonly library: any;

    constructor(libraryPath: string) {
        this.addon = require('bindings')({
            bindings: 'binding.node',
            module_root: path.dirname(__filename),
            try: [['module_root', 'build', 'bin', 'bindings']]
        });
        this.library = new this.addon.Library(libraryPath);
    }

//NBG_LIBRARY_FUNCTIONS
}