import {
    getStructureWrapperName,
    IFunction,
    ITypeDescriptor,
    IStructure,
    NativeTypeT
} from "./common";
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
        | 'struct'

    function toCppType(typeDescriptor: ITypeDescriptor): CppTypeT | string {
        switch (typeDescriptor.type) {
            case "structure":
                return typeDescriptor.structureName;
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

        throw Error('Logic error');
        // TODO fix assert
        // assertUnreachable(typeDescriptor.type);
    }

    function makeCppType(argData: ITypeDescriptor): CppTypeT | string {
        switch (argData.type) {
            case 'structure':
                return argData.structureName;
            case 'pointer':
                return makeCppType(argData.underlyingType) + '*'; // TODO handle const-correctness
            case 'void':
                return 'void';
            case 'int8':
                return 'std::int8_t';
            case 'int16':
                return 'std::int16_t';
            case 'int32':
                return 'std::int32_t';
            case 'int64':
                return 'std::int64_t';
            case 'float32':
                return 'float';
            case 'float64':
                return 'double';
        }
        // TODO fix assertion
        // assertUnreachable(argData.type);

        throw Error('Logic error. Unknown type.')
    }


    function makeJsValue(typeDescriptor: ITypeDescriptor, expression: string, envName: string): string {
        switch (typeDescriptor.type) {
            case 'structure':
                const structureWrappedName = getStructureWrapperName(typeDescriptor.structureName);
                return `${structureWrappedName}::FromNativeValue(${envName}, ${expression})`;
            case 'pointer':
                return `Pointer::FromNativeValue(${envName}, ${expression})`;
            case 'void':
            case 'int8':
            case 'int16':
            case 'int32':
            case 'int64':
            case 'float32':
            case 'float64':
                return `Napi::Value::From(${envName}, ${expression})`;
        }
        // TODO fix assertion
        // assertUnreachable(argData.type);

        throw Error('Logic error. Unknown type.')
    }

    function formatNapiGetter(name: string, nativeType: NativeTypeT) {
        switch (nativeType) {
            case "structure":
                throw new Error('Not yet implemented');
            case "pointer":
                // return `(Napi::ObjectWrap<Pointer>::Unwrap(${name}).As<Napi::Object>()))->asPtr<${cppType}>();`
                return `(Napi::ObjectWrap<Pointer>::Unwrap(${name}.As<Napi::Object>()))->asPtr<int*>()`;
            case "void":
                throw new Error('Logic error. Argument type cannot be void');
            case "int8":
                return `${name}.As<Napi::Number>().Int8Value()`;
            case "int16":
                return `${name}.As<Napi::Number>().Int16Value()`;
            case "int32":
                return `${name}.As<Napi::Number>().Int32Value()`;
            case "int64":
                return `${name}.As<Napi::Number>().Int64Value()`;
            case "float32":
                return `${name}.As<Napi::Number>().FloatValue()`;
            case "float64":
                return `${name}.As<Napi::Number>().DoubleValue()`;
        }
        assertUnreachable(nativeType);
    }

    function makeArgumentReader(argument: ITypeDescriptor, index: number) {
        if (argument.type === "structure") {
            const structureWrappedName = getStructureWrapperName(argument.structureName);
            return `auto& arg${index} = (Napi::ObjectWrap<${structureWrappedName}>::Unwrap(args[${index}].As<Napi::Object>()))->nbgGetData();`
        }

        if (argument.type === "pointer") {
            const cppType = makeCppType(argument);
            return `${cppType} const arg${index} = (Napi::ObjectWrap<Pointer>::Unwrap(args[${index}].As<Napi::Object>()))->asPtr<${cppType}>();`
        }
        const name = `args[${index}]`;
        return `const auto arg${index} = ${formatNapiGetter(name, argument.type)};`
    }

    export function makeFunctionDeclaration(func: IFunction) {
        const returnType = func.returnType.type === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} ${func.name}(const Napi::CallbackInfo& args);`
    }

    export function makeFunctionEnumeration(func: IFunction) {
        return `        InstanceMethod("${func.name}", &Library::${func.name})`
    }

    export function makeFunctionDefinition(func: IFunction) {
        const returnType = func.returnType.type === 'void' ? 'void' : 'Napi::Value';

        const argsParsing = func.arguments.map(makeArgumentReader).join('\n\n');

        const argNames = func.arguments.map((_, index) => {
            return `arg${index}`;
        }).join(', ');

        const argTypes = func.arguments.map(makeCppType).join(', ');

        return `${returnType} Library::${func.name}(const Napi::CallbackInfo& args){
    const auto env = args.Env();
//    Napi::EscapableHandleScope scope(env);
    Napi::HandleScope scope(env);
    
    if (args.Length() != ${func.arguments.length}) {
        throw Napi::Error::New(env, "Library.${func.name} take ${func.arguments.length} arguments, but args.Length() given");
    }

    ${argsParsing}
    try{
        const auto function = m_library.get<${makeCppType(func.returnType)}(${argTypes})>("${func.name}");
        ${returnType === 'void' ? `function(${argNames});` :
            `return ${makeJsValue(func.returnType, `function(${argNames})`, 'env')};`}
    }
    catch(const std::exception& e){
        throw Napi::TypeError::New(env, e.what());
    }
}`
    }

    export function makeStructureDeclaration(structure: IStructure) {
        const name = getStructureWrapperName(structure.name);

        const getters = structure.members.map(value => {
            const getterName = `Get${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `    Napi::Value ${getterName}(const Napi::CallbackInfo &info);`
        }).join('\n');

        const setters = structure.members.map(value => {
            const setterName = `Set${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `    void ${setterName}(const Napi::CallbackInfo &info, const Napi::Value &value);`
        }).join('\n');

        return `
struct ${structure.name} {
${structure.members.map(value => `    ${makeCppType(value)} ${value.name};`).join('\n')}
};

class ${name} : public Napi::ObjectWrap<${name}> {
public:
    static void Init(Napi::Env env, Napi::Object exports);
    ${name}(const Napi::CallbackInfo& info);
    
${getters}
${setters}

    static Napi::Object New(const Napi::Value arg){
        return constructor.New({arg});
    }
    
    static Napi::Object FromNativeValue(const Napi::Env env, ${structure.name} &&value);

    auto& nbgGetData() {
        return *m_ptr;
    }
    
    const auto& nbgGetData() const {
        return *m_ptr;
    }
    
    Napi::Value asPointer(const Napi::CallbackInfo &info) {
        const auto env = info.Env();
        Napi::HandleScope scope(env);
        return Pointer::FromNativeValue(env, m_ptr);
    }
    
private:
    static Napi::FunctionReference constructor;
    static Napi::Value getSize(const Napi::CallbackInfo& info);
    
    ${structure.name}* m_ptr = nullptr;
    std::unique_ptr<${structure.name}> m_data;
}; // class ${name}
`
    }

    export function makeStructureDefinition(structure: IStructure) {
        const name = getStructureWrapperName(structure.name);

        const getters = structure.members.map(value => {
            const getterName = `Get${capitalizeFirstLetter(toCamelCase(value.name))}`;

            const jsValue = makeJsValue(value,  `m_ptr->${value.name}`, 'env');
            return `` +
                `Napi::Value ${name}::${getterName}(const Napi::CallbackInfo &info) {\n` +
                `   Napi::Env env = info.Env();\n` +
                `   return ${jsValue};` +
                `}`
        }).join('\n\n');


        const setters = structure.members.map(value => {
            const setterName = `Set${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `` +
                `void ${name}::${setterName}(const Napi::CallbackInfo &info, const Napi::Value &value) {\n` +
                `   Napi::Env env = info.Env();\n` +
                `   m_ptr->${value.name} = ${formatNapiGetter('value', value.type)};\n` +
                `}`
        }).join('\n\n');

        const accessors = structure.members.map(value => {
            const setterName = `Set${capitalizeFirstLetter(toCamelCase(value.name))}`;
            const getterName = `Get${capitalizeFirstLetter(toCamelCase(value.name))}`;
            return `        InstanceAccessor("${value.name}", &${name}::${getterName}, &${name}::${setterName})`;
        }).join(',\n');

        const fromObjectInitialization = structure.members.map(value => {
            const fieldGetter = `object.Get("${value.name}")`;
            return `        m_ptr->${value.name} = ${formatNapiGetter(fieldGetter, value.type)};`
        }).join('\n');

        return `Napi::FunctionReference ${name}::constructor;

Napi::Object ${name}::FromNativeValue(const Napi::Env env, ${structure.name} &&value) {
    auto buffer = Napi::Buffer<${structure.name}>::New(env, 1);
    *(buffer.Data()) = std::move(value);
    return ${name}::New(buffer);
}

void ${name}::Init(const Napi::Env env, Napi::Object exports) {
    const Napi::HandleScope scope(env);
    const auto definition = DefineClass(env, "${name}", {
        StaticMethod("getSize", getSize),
        InstanceMethod("asPointer", &${name}::asPointer), 
${accessors}
    });

    constructor = Napi::Persistent(definition);
    constructor.SuppressDestruct();

    exports.Set("${name}", definition);
}

Napi::Value ${name}::getSize(const Napi::CallbackInfo& info) {
    const auto env = info.Env();
    return Napi::Value::From(env, sizeof(${structure.name}));
}

${name}::${name}(const Napi::CallbackInfo& info) : ObjectWrap<${name}>(info) {
    const auto env = info.Env();
    Napi::HandleScope scope(env);
    
    if (info.Length() == 0) {
        m_data = std::make_unique<${structure.name}>();
        m_ptr = m_data.get();
        return;
    }
    
    if (info.Length() != 1) {
        throw Napi::Error::New(env, "${name}.constructor accepts 0 or 1 arguments, but " + std::to_string(info.Length()) + " is given");
    }
    
    if (info[0].IsExternal()) {
        //TODO implement
        throw Napi::TypeError::New(env, "Not implemented");
        return;
    }
        
    if (info[0].IsBuffer()) {
        //TODO hold reference to object to prevent its garbage collection
        
        const auto buffer = info[0].As<Napi::Buffer<std::uint8_t>>();
        if (buffer.Length() < sizeof(${structure.name})) {
            throw Napi::TypeError::New(env, "Bad buffer length: Buffer length is " +
                std::to_string(buffer.Length()) + ", sizeof(${structure.name})=" +
                std::to_string(sizeof(${structure.name})));
        }
        
        m_ptr = static_cast<${structure.name}*>(static_cast<void*>(buffer.Data()));
        return;
    }
    
    if (info[0].IsObject()) {
        m_data = std::make_unique<${structure.name}>();
        m_ptr = m_data.get();
        const auto object = info[0].As<Napi::Object>();
        
${fromObjectInitialization}

        return;
    }
    
    throw Napi::Error::New(env, "Invalid arguments given for ${name}.constructor");
}

${getters}

${setters}
`
    }

    export function makeStructureWrapperInitializer(structure: IStructure) {
        return `${getStructureWrapperName(structure.name)}::Init(env, exports);`;
    }
}