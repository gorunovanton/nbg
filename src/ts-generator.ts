import {IFunction, toTsType} from "./common";
import {toCamelCase} from "./utils";

export namespace TS {
    export function makeFunctionDefinition(func: IFunction) {
        const returnType = toTsType(func.returnType);
        const functionName = toCamelCase(func.name);
        const functionArgs = func.arguments.map(value => `${value.name}: ${toTsType(value.type)}`).join(', ');
        const callArgs = func.arguments.map(value => value.name).join(', ');

        return `    public ${functionName}(${functionArgs}): ${returnType} {
        return this.library.${func.name}(${callArgs});
    }`
    }
}
