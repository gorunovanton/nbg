import * as fs from 'fs-extra'
import * as path from 'path'

import * as gyp from "./templates/gyp";
import * as cmake from "./templates/cmake";
import * as conan from "./templates/conan";

export interface IStructure {
}

type NativeTypeT = 'pointer' | 'void' | 'int8' | 'int16' | 'int32' | 'int64' | 'float32' | 'float64' // TODO extend

function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

function toCamelCase(str: string) {
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
        if (p2) return p2.toUpperCase();
        return p1.toLowerCase();
    });
}

function toTsType(nativeType: NativeTypeT) {
    switch (nativeType) {
        case "pointer":
            throw new Error('Not yet implemented');
        case "void":
            return 'void';
        case "int8":
        case "int16":
        case "int32":
        case "int64":
        case "float32":
        case "float64":
            return 'number';
    }

    assertUnreachable(nativeType);
}

export interface IFunction {
    name: string
    arguments: NativeTypeT[]
    returnType: NativeTypeT
}

export interface ILibraryData {
    structures: IStructure[]
    functions: IFunction[]
}

const testLibraryData: ILibraryData = {
    structures: [],
    functions: [{
        name: 'hello',
        returnType: 'void',
        arguments: []
    },
        {
            name: 'get_five',
            returnType: 'int32',
            arguments: []
        }
    ]
};

async function saveWithoutOverride(filename: string, data: string) {
    if (await fs.pathExists(filename)) {
        const oldData = await fs.readFile(filename);
        if (oldData.toString() === data) {
            return
        }
    }

    await fs.writeFile(filename, data);
}

export async function generateLibrary() {
    const libraryFilename = path.join('output', 'binding.cpp');
    await fs.ensureDir('output');

    const functionDeclarations = testLibraryData.functions.map(value => {
        const returnType = value.returnType === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} ${value.name}(const Napi::CallbackInfo& args);`
    }).join('\n');

    const functionEnumeration = testLibraryData.functions.map(value => {
        return `        InstanceMethod("${value.name}", &Library::${value.name})`
    }).join(',\n');

    const functionDefinitions = testLibraryData.functions.map(value => {
        const returnType = value.returnType === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} Library::${value.name}(const Napi::CallbackInfo& args){
    const auto env = args.Env();
    ${returnType === 'void' ? '' : 'return env.Undefined();'}
}`
    }).join('\n\n');

    const tsFunctionDefinitions = testLibraryData.functions.map(value => {
        const returnType = toTsType(value.returnType);
        const functionName = toCamelCase(value.name);
        return `    public ${functionName}(): ${returnType} {
        return this.library.${value.name}();
    }`
    }).join('\n\n');

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