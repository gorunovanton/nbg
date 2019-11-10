import * as path from 'path'

export class Library{
    constructor(){
        const addon = require('bindings')({
            bindings: 'binding.node',
            module_root: path.dirname(__filename),
            try: [['module_root', 'build', 'bin', 'bindings']]
        });


        console.log('addon', addon);

        const library = new addon.Library();
        console.log('library: ', library);

        console.log('library.hello', library.hello);
        console.log('library.hello()', library.hello());
    }

    //NBG_LIBRARY_FUNCTIONS
}

function main(){
    const lib = new Library();
    console.log('Finished');
}

main();