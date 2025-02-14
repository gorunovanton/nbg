import * as fs from 'fs-extra';
import * as path from 'path';

import * as gyp from "./templates/gyp";
import * as cmake from "./templates/cmake";
import * as conan from "./templates/conan";
import {CPlusPlus} from "./cpp-generator";
import {TS} from "./ts-generator";
import {saveWithoutOverride} from "./utils";
import {testLibraryData} from './test-data';

export async function generateLibrary() {
    const libraryFilename = path.join('output', 'binding.cpp');
    await fs.ensureDir('output');

    const functionDeclarations = testLibraryData.functions.map(CPlusPlus.makeFunctionDeclaration).join('\n');
    const functionEnumeration = testLibraryData.functions.map(CPlusPlus.makeFunctionEnumeration).join(',\n');
    const functionDefinitions = testLibraryData.functions.map(CPlusPlus.makeFunctionDefinition).join('\n\n');
    const tsFunctionDefinitions = testLibraryData.functions.map(TS.makeFunctionDefinition).join('\n\n');
    const tsFunctionDeclarations = testLibraryData.functions.map(TS.makeFunctionDeclaration).join('\n\n');

    const structuresDeclarations = testLibraryData.structures.map(CPlusPlus.makeStructureDeclaration).join('\n');
    const structureDefinitions = testLibraryData.structures.map(CPlusPlus.makeStructureDefinition).join('\n');
    const structureInitializationCalls = testLibraryData.structures.map(CPlusPlus.makeStructureWrapperInitializer).join('\n');
    const tsStructuresDefinitions = testLibraryData.structures.map(TS.makeStructureDefinition).join('\n\n');
    const tsStructuresDeclarations = testLibraryData.structures.map(TS.makeStructureDeclaration).join('\n');

    const gypFilename = path.join('output', 'binding.gyp');
    const cmakeFilename = path.join('output', 'CMakeLists.txt');
    const conanFilename = path.join('output', 'conanfile.txt');
    const tsFilename = path.join('output', 'library.ts');

    const addonTemplate = (await fs.readFile('src/templates/addon.cpp')).toString();
    const addonCode = addonTemplate
        .replace(/\/\/NBG_STRUCTURE_WRAPPERS_INIT/g, structureInitializationCalls)
        .replace(/\/\/NBG_STRUCTURES_DECLARATIONS/g, structuresDeclarations)
        .replace(/\/\/NBG_STRUCTURE_DEFINITIONS/g, structureDefinitions)
        .replace(/\/\/NBG_FUNCTION_DECLARATIONS/g, functionDeclarations)
        .replace(/\/\/NBG_FUNCTION_ENUMERATION/g, functionEnumeration)
        .replace(/\/\/NBG_FUNCTION_DEFINITIONS/g, functionDefinitions);

    const tsLibraryTemplate = (await fs.readFile('src/templates/library.ts')).toString();
    const tsLibraryCode = tsLibraryTemplate
        .replace(/\/\/NBG_TS_FUNCTION_DECLARATIONS/g, tsFunctionDeclarations)
        .replace(/\/\/NBG_LIBRARY_FUNCTIONS/g, tsFunctionDefinitions)
        .replace(/\/\/NBG_LIBRARY_STRUCTURES_DEFINITIONS/g, tsStructuresDefinitions)
        .replace(/\/\/NBG_LIBRARY_STRUCTURES_DECLARATIONS/g, tsStructuresDeclarations);

    await saveWithoutOverride(tsFilename, tsLibraryCode);
    await saveWithoutOverride(libraryFilename, addonCode);
    await saveWithoutOverride(gypFilename, gyp.template);
    await saveWithoutOverride(cmakeFilename, cmake.template);
    await saveWithoutOverride(conanFilename, conan.template);
}

generateLibrary().then(() => console.log('finished'));