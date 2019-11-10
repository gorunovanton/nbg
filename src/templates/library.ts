import * as path from 'path'

interface IAddon {
    Library: any
}

export class Library {
    private readonly addon: IAddon;
    private readonly library: any;

    constructor() {
        this.addon = require('bindings')({
            bindings: 'binding.node',
            module_root: path.dirname(__filename),
            try: [['module_root', 'build', 'bin', 'bindings']]
        });
        console.log('addon', this.addon);

        this.library = new this.addon.Library();
        console.log('library: ', this.library);

        console.log('library.hello', this.library.hello);
        console.log('library.hello()', this.library.hello());
    }

//NBG_LIBRARY_FUNCTIONS
}

function main() {
    const lib = new Library();
    console.log('Finished');
}

main();