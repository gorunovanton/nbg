import * as fs from 'fs-extra'
import * as path from 'path'

import * as gyp from "./templates/gyp";
import * as cmake from "./templates/cmake";
import * as conan from "./templates/conan";
import {ILibraryData} from "./common";
import {CPlusPlus} from "./cpp-generator";
import {TS} from "./ts-generator";
import {saveWithoutOverride} from "./utils";

const testLibraryData: ILibraryData = {
    structures: [],
    functions: [
        {
            name: 'hello',
            returnType: 'void',
            arguments: []
        },
        {
            name: 'get_five',
            returnType: 'int32',
            arguments: []
        },
        {
            name: 'duplicate',
            returnType: 'int32',
            arguments: ["int32"]
        }
    ]
};

export async function generateLibrary() {
    const libraryFilename = path.join('output', 'binding.cpp');
    await fs.ensureDir('output');

    const functionDeclarations = testLibraryData.functions.map(CPlusPlus.makeFunctionDeclaration).join('\n');
    const functionEnumeration = testLibraryData.functions.map(CPlusPlus.makeFunctionEnumeration).join(',\n');
    const functionDefinitions = testLibraryData.functions.map(CPlusPlus.makeFunctionDefinition).join('\n\n');
    const tsFunctionDefinitions = testLibraryData.functions.map(TS.makeFunctionDefinition).join('\n\n');

    const gypFilename = path.join('output', 'binding.gyp');
    const cmakeFilename = path.join('output', 'CMakeLists.txt');
    const conanFilename = path.join('output', 'conanfile.txt');
    const tsFilename = path.join('output', 'library.ts');

    const addonTemplate = (await fs.readFile('src/templates/addon.cpp')).toString();
    const addonCode = addonTemplate
        .replace(/\/\/NBG_FUNCTION_DECLARATIONS/g, functionDeclarations)
        .replace(/\/\/NBG_FUNCTION_ENUMERATION/g, functionEnumeration)
        .replace(/\/\/NBG_FUNCTION_DEFINITIONS/g, functionDefinitions);

    const tsLibraryTemplate = (await fs.readFile('src/templates/library.ts')).toString();
    const tsLibraryCode = tsLibraryTemplate
        .replace(/\/\/NBG_LIBRARY_FUNCTIONS/g, tsFunctionDefinitions);

    await saveWithoutOverride(tsFilename, tsLibraryCode);
    await saveWithoutOverride(libraryFilename, addonCode);
    await saveWithoutOverride(gypFilename, gyp.template);
    await saveWithoutOverride(cmakeFilename, cmake.template);
    await saveWithoutOverride(conanFilename, conan.template);
}

generateLibrary().then(() => console.log('finished'));