import {assertUnreachable} from "./utils";

export interface IStructure {
}

type NativeTypeT = 'pointer' | 'void' | 'int8' | 'int16' | 'int32' | 'int64' | 'float32' | 'float64' // TODO extend
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

export interface IFunction {
    name: string
    arguments: NativeTypeT[]
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

export function toCppType(nativeType: NativeTypeT): CppTypeT {
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
