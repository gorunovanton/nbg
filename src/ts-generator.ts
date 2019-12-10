import {getStructureWrapperName, IFunction, IStructure, ITypeDescriptor} from "./common";
import {toCamelCase} from "./utils";

export namespace TS {
    function toTsType(typeDescription: ITypeDescriptor) {
        switch (typeDescription.type) {
            case "structure":
                return `I${getStructureWrapperName(typeDescription.structureName)}`;
            case "pointer":
                return 'IPointer';
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
        throw Error('Logic error. Unhandled type')
        // assertUnreachable(typeDescription.type);
    }

    export function makeFunctionDefinition(func: IFunction) {
        const returnType = toTsType(func.returnType);
        const functionName = toCamelCase(func.name);
        const functionArgs = func.arguments.map(value => `${value.name}: ${toTsType(value)}`).join(', ');
        const callArgs = func.arguments.map(value => value.name).join(', ');

        return `    public ${functionName}(${functionArgs}): ${returnType} {
        return this.library.${func.name}(${callArgs});
    }`
    }

    export function makeFunctionDeclaration(func: IFunction) {
        const returnType = toTsType(func.returnType);
        const functionName = toCamelCase(func.name);
        const functionArgs = func.arguments.map(value => `${value.name}: ${toTsType(value)}`).join(', ');
        return `    ${functionName}(${functionArgs}): ${returnType}`
    }

    export function makeStructureDefinition(struct: IStructure) {
        const members = struct.members.map(value => {
            return `    ${value.name}: ${toTsType(value)}`;
        }).join('\n');

        const constructorArguments = struct.members.map(value => {
            return `${value.name}: ${toTsType(value)}`;
        }).join(', ');

        return `export interface I${getStructureWrapperName(struct.name)} {
    new(data?: {${constructorArguments}} | Buffer): I${getStructureWrapperName(struct.name)}
    getSize(): number
    
${members}
}`
    }

    export function makeStructureDeclaration(struct: IStructure) {
        return `    ${getStructureWrapperName(struct.name)}: I${getStructureWrapperName(struct.name)}`
    }
}
