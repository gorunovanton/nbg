import {IFunction, NativeTypeT, toCppType} from "./common";
import {assertUnreachable} from "./utils";

export namespace CPlusPlus {
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
            return `const auto arg${index} = args[${index}]${formatNapiGetter(value)};`
        }).join('\n\n');

        const argNames = func.arguments.map((_, index) => {
            return `arg${index}`;
        }).join(', ');

        const argTypes = func.arguments.map(value => toCppType(value)).join(', ');

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
}