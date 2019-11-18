import {getStructureWrapperName, IFunction, IStructure, toTsType} from "./common";
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
    export function makeFunctionDeclaration(func: IFunction) {
        const returnType = toTsType(func.returnType);
        const functionName = toCamelCase(func.name);
        const functionArgs = func.arguments.map(value => `${value.name}: ${toTsType(value.type)}`).join(', ');
        return `    ${functionName}(${functionArgs}): ${returnType}`
    }

    export function makeStructureDefinition(struct: IStructure) {
        const members = struct.members.map(value => {
            return `    ${value.name}: ${toTsType(value.type)}`;
        }).join('\n');

        return `export interface I${getStructureWrapperName(struct)} {
${members}
}`
    }

    export function makeStructureDeclaration(struct: IStructure) {
        return `    ${getStructureWrapperName(struct)}: I${getStructureWrapperName(struct)}`
    }
}
