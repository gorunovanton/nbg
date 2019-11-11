import {IFunction, toCppType} from "./common";

export namespace CPlusPlus {
    export function makeFunctionDeclaration(func: IFunction) {
        const returnType = func.returnType === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} ${func.name}(const Napi::CallbackInfo& args);`
    }

    export function makeFunctionEnumeration(func: IFunction) {
        return `        InstanceMethod("${func.name}", &Library::${func.name})`
    }

    export function makeFunctionDefinition(func: IFunction) {
        const returnType = func.returnType === 'void' ? 'void' : 'Napi::Value';
        return `${returnType} Library::${func.name}(const Napi::CallbackInfo& args){
    const auto env = args.Env();
    try{
        const auto function = m_library.get<${toCppType(func.returnType)}()>("${func.name}");
        ${returnType === 'void' ? 'function();' : 'return Napi::Value::From(env, function());'}
    }
    catch(const std::exception& e){
        Napi::TypeError::New(env, e.what()).ThrowAsJavaScriptException();
    }
}`
    }
}