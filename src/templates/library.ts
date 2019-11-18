import * as path from 'path'

interface ILibrary {
    new(libraryPath: string): any

//NBG_TS_FUNCTION_DECLARATIONS
}

//NBG_LIBRARY_STRUCTURES_DEFINITIONS

interface IAddon {
    Library: ILibrary

//NBG_LIBRARY_STRUCTURES_DECLARATIONS
}

export class Library {
    public readonly addon: IAddon;
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