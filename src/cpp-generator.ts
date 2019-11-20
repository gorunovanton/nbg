import {getStructureWrapperName, IFunction, IStructure, NativeTypeT} from "./common";
import {assertUnreachable, capitalizeFirstLetter, toCamelCase} from "./utils";

export namespace CPlusPlus {
    type CppTypeT =
        'std::int8_t'
        | 'std::int16_t'
        | 'std::int32_t'
        | 'std::int64_t'
        | 'std:uint8_t'
        | 'std::uint16_t'
        | 'std::uint32_t'
        | 'std::uint64_t'
        | 'float'
        | 'double'
        | 'void'
        | 'void*'

    function toCppType(nativeType: NativeTypeT): CppTypeT {
        switch (nativeType) {
            case "pointer":
                return 'void*';
            case "void":
                return 'void';
            case "int8":
                return 'std::int8_t';
            case "int16":
                return 'std::int16_t';
            case "int32":
                return 'std::int32_t';
            case "int64":
                return 'std::int64_t';
            case "float32":
                return 'float';
            case "float64":
                return 'double';
        }

        assertUnreachable(nativeType);
    }

    function formatNapiGetter(nativeType: NativeTypeT) {
        switch (nativeType) {
            case "pointer":
                throw new Error('Not yet implemented');
            case "void":
                throw new Error('Logic error. Argument type cannot be void');
            case "int8":
                return '.As<Napi::Number>().Int8Value()';
            case "int16":
                return '.As<Napi::Number>().Int16Value()';
            case "int32":
                return '.As<Napi::Number>().Int32Value()';
            case "int64":
                return '.As<Napi::Number>().Int64Value()';
            case "float32":
                return '.As<Napi::Number>().FloatValue()';
            case "float64":
                return '.As<Napi::Number>().DoubleValue()';
        }
        assertUnreachable(nativeType);
    }

    export function makeFunctionDeclaration(func: IFunction) {
        const returnType = func.returnType === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} ${func.name}(const Napi::CallbackInfo& args);`
    }

    export function makeFunctionEnumeration(func: IFunction) {
        return `        InstanceMethod("${func.name}", &Library::${func.name})`
    }

    export function makeFunctionDefinition(func: IFunction) {
        const returnType = func.returnType === 'void' ? 'void' : 'Napi::Value';

        const argsParsing = func.arguments.map((value, index) => {
            return `const auto arg${index} = args[${index}]${formatNapiGetter(value.type)};`
        }).join('\n\n');

        const argNames = func.arguments.map((_, index) => {
            return `arg${index}`;
        }).join(', ');

        const argTypes = func.arguments.map(value => toCppType(value.type)).join(', ');

        return `${returnType} Library::${func.name}(const Napi::CallbackInfo& args){
    const auto env = args.Env();
    if (args.Length() != ${func.arguments.length}) {
        throw Napi::Error::New(env, "Library.${func.name} take ${func.arguments.length} arguments, but args.Length() given");
    }

    ${argsParsing}
    try{
        const auto function = m_library.get<${toCppType(func.returnType)}(${argTypes})>("${func.name}");
        ${returnType === 'void' ? 'function();' : `return Napi::Value::From(env, function(${argNames}));`}
    }
    catch(const std::exception& e){
        throw Napi::TypeError::New(env, e.what());
    }
}`
    }

    export function makeStructureDeclaration(structure: IStructure) {
        const name = getStructureWrapperName(structure);

        const getters = structure.members.map(value => {
            const getterName = `Get${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `Napi::Value ${getterName}(const Napi::CallbackInfo &info);\n`
        }).join('\n');

        const setters = structure.members.map(value => {
            const setterName = `Set${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `void ${name}::${setterName}(const Napi::CallbackInfo &info, const Napi::Value &value);\n`
        }).join('\n');

        return `
struct ${structure.name} {
${structure.members.map(value => `    ${toCppType(value.type)} ${value.name};`).join('\n')}
};

class ${name} : public Napi::ObjectWrap<${name}> {
public:
    static void Init(Napi::Env env, Napi::Object exports);
    ${name}(const Napi::CallbackInfo& info);
    
    ${getters}
    
    ${setters}
private:
    static Napi::FunctionReference constructor;
    
    ${structure.name}* m_ptr = nullptr;
    std::unique_ptr<${structure.name}> m_data;
}; // class ${name}
`
    }

    export function makeStructureDefinition(structure: IStructure) {
        const name = getStructureWrapperName(structure);

        const getters = structure.members.map(value => {
            const getterName = `Get${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `` +
                `Napi::Value ${name}::${getterName}(const Napi::CallbackInfo &info) {\n` +
                `   Napi::Env env = info.Env();\n` +
                `   return Napi::Value::From(env, m_ptr->${value.name});\n` +
                `}`
        }).join('\n\n');


        const setters = structure.members.map(value => {
            const setterName = `Set${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `` +
                `void ${name}::${setterName}(const Napi::CallbackInfo &info, const Napi::Value &value) {\n` +
                `   Napi::Env env = info.Env();\n` +
                `   m_ptr->${value.name} = value${formatNapiGetter(value.type)};\n` +
                `}`
        }).join('\n\n');

        const accessors = structure.members.map(value => {
            const setterName = `Set${capitalizeFirstLetter(toCamelCase(value.name))}`;
            const getterName = `Get${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `        InstanceAccessor("${value.name}", &${name}::${getterName}, &${name}::${setterName})`;
        }).join(',\n');

        return `Napi::FunctionReference ${name}::constructor;

void ${name}::Init(const Napi::Env env, Napi::Object exports) {
    const Napi::HandleScope scope(env);
    const auto definition = DefineClass(env, "${name}", {
    ${accessors}
    });

    constructor = Napi::Persistent(definition);
    constructor.SuppressDestruct();

    exports.Set("${name}", definition);
}

${name}::${name}(const Napi::CallbackInfo& info) : ObjectWrap<${name}>(info) {
    const auto env = info.Env();
    Napi::HandleScope scope(env);
    
    m_data = std::make_unique<${structure.name}>();
    m_ptr = m_data.get();
}

${getters}

${setters}
`
    }

    export function makeStructureWrapperInitializer(structure: IStructure) {
        return `${getStructureWrapperName(structure)}::Init(env, exports);`;
    }
}