import * as fs from 'fs-extra'

export interface IStructure {
}

type ArgumentTypes = 'pointer' | 'int8' | 'int16' | 'int32' | 'int64' | 'float32' | 'float64' // TODO extend

export interface IFunction {
    name: string
    arguments: ArgumentTypes[]
}

export interface ILibraryData {
    structures?: IStructure[]
    functions?: IFunction[]
}

const testLibraryData: ILibraryData = {
    functions: [{
        name: 'hello',
        arguments: []
    }]
};

export async function generateLibrary() {
    const libraryFilename = 'binding.cpp';

    const addonCode = `
#include <napi.h>

class DynamicLibrary : public Napi::ObjectWrap<DynamicLibrary> {
public:
    static void Init(Napi::Env env, Napi::Object exports);
    
    Napi::Value hello(const Napi::CallbackInfo& args);
}; // class DynamicLibrary

void DynamicLibrary::Init(const Napi::Env env, Napi::Object exports) {
    const Napi::HandleScope scope(env);

    const auto func = DefineClass(env, "DynamicLibrary", {
        InstanceMethod("hello", &DynamicLibrary::hello),
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
    exports.Set("DynamicLibrary", func);
}

Napi::Object Init(const Napi::Env env, const Napi::Object exports) {
    DynamicLibrary::Init(env, exports);
    return exports;
}

NODE_API_MODULE(addon, Init)
`;

    const gypFilename = 'binding.gyp';
    const gypSource = {
        "targets": [
            {
                "target_name": "binding",
                "sources": ["binding.cpp"],
                'include_dirs': [
                    "<!@(node -p \"require('node-addon-api').include\")"
                ],
                'dependencies': [
                    "<!(node -p \"require('node-addon-api').gyp\")"
                ],
                'cflags!': ['-fno-exceptions'],
                'cflags_cc!': ['-fno-exceptions'],
                'xcode_settings': {
                    'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                    'CLANG_CXX_LIBRARY': 'libc++',
                    'MACOSX_DEPLOYMENT_TARGET': '10.7',
                },
                'msvs_settings': {
                    'VCCLCompilerTool': {'ExceptionHandling': 1},
                },
            }
        ],
    };

    const gypFileContent = JSON.stringify(gypSource, null, 4);

    await fs.writeFile(libraryFilename, addonCode);
    await fs.writeFile(gypFilename, gypFileContent);
}

generateLibrary().then(() => console.log('finished'));