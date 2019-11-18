import {assertUnreachable} from "./utils";

export interface IStructureMember {
    name: string
    type: NativeTypeT
}

export interface IStructure {
    name: string
    members: IStructureMember[]
}

export type NativeTypeT = 'pointer' | 'void' | 'int8' | 'int16' | 'int32' | 'int64' | 'float32' | 'float64' // TODO extend

export interface IFunctionArgument {
    name: string
    type: NativeTypeT
}

export interface IFunction {
    name: string
    arguments: IFunctionArgument[]
    returnType: NativeTypeT
}

export interface ILibraryData {
    structures: IStructure[]
    functions: IFunction[]
}

export function toTsType(nativeType: NativeTypeT) {
    switch (nativeType) {
        case "pointer":
            throw new Error('Not yet implemented');
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

    assertUnreachable(nativeType);
}

export function getStructureWrapperName(structure: IStructure) {
    return `${structure.name}_wrapper`
}