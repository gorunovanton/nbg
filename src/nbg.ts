import * as fs from 'fs-extra'
import * as path from 'path'
import {gypTemplate} from "./templates/gyp";

export interface IStructure {
}

type DataTypeT = 'pointer' | 'void' | 'int8' | 'int16' | 'int32' | 'int64' | 'float32' | 'float64' // TODO extend

export interface IFunction {
    name: string
    arguments: DataTypeT[]
    returnType: DataTypeT
}

export interface ILibraryData {
    structures?: IStructure[]
    functions?: IFunction[]
}

const testLibraryData: ILibraryData = {
    functions: [{
        name: 'hello',
        returnType: 'void',
        arguments: []
    }]
};

export async function generateLibrary() {
    const libraryFilename = path.join('output', 'binding.cpp');
    await fs.ensureDir('output');

    const functionDeclarations = testLibraryData.functions.map(value => {
        const returnType = value.returnType === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} ${value.name}(const Napi::CallbackInfo& args);`
    }).join('\n');

    const functionsEnumeration = testLibraryData.functions.map(value => {
        return `InstanceMethod("${value.name}", &Library::${value.name}),`
    }).join(',\n');

    const functionDefinitions = testLibraryData.functions.map(value => {
        const returnType = value.returnType === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} Library::${value.name}(const Napi::CallbackInfo& args){}`
    }).join('\n\n');

    const addonCode = `
#include <napi.h>

class Library : public Napi::ObjectWrap<Library> {
public:
    static void Init(Napi::Env env, Napi::Object exports);
    Library(const Napi::CallbackInfo& info);
    
    ${functionDeclarations}
    
private:
    static Napi::FunctionReference constructor;
}; // class Library

Napi::FunctionReference Library::constructor;

Library::Library(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<Library>(info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
}

void Library::Init(const Napi::Env env, Napi::Object exports) {
    const Napi::HandleScope scope(env);

    const auto func = DefineClass(env, "Library", {
        ${functionsEnumeration}
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("Library", func);
}

${functionDefinitions}

Napi::Object Init(const Napi::Env env, const Napi::Object exports) {
    Library::Init(env, exports);
    return exports;
}

NODE_API_MODULE(addon, Init)
`;
    const gypFilename = path.join('output', 'binding.gyp');
    const gypFileContent = JSON.stringify(gypTemplate, null, 4);

    await fs.writeFile(libraryFilename, addonCode);
    await fs.writeFile(gypFilename, gypFileContent);
}

generateLibrary().then(() => console.log('finished'));