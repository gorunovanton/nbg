import {IFunction, toTsType} from "./common";
import {toCamelCase} from "./utils";

export namespace TS {
    export function makeFunctionDefinition(func: IFunction) {
        const returnType = toTsType(func.returnType);
        const functionName = toCamelCase(func.name);
        return `    public ${functionName}(): ${returnType} {
        return this.library.${func.name}();
    }`
    }
}
