export type NativeTrivialTypeT = 'void' | 'int8' | 'int16' | 'int32' | 'int64' | 'float32' | 'float64'
export type NativeTypeT = 'pointer' | 'structure' | NativeTrivialTypeT

interface IBaseTypeDescriptor {
    type: NativeTypeT
}

export interface ITrivialTypeDescriptor extends IBaseTypeDescriptor {
    type: NativeTrivialTypeT
}

export interface IStructureTypeDescriptor extends IBaseTypeDescriptor {
    type: 'structure'
    structureName: string
}

export interface IPointerTypeDescriptor extends IBaseTypeDescriptor {
    type: 'pointer'
}

export type ITypeDescriptor = ITrivialTypeDescriptor | IStructureTypeDescriptor | IPointerTypeDescriptor

export interface INamedParameter {
    name: string
}

export interface IStructure {
    name: string
    members: Array<ITypeDescriptor & INamedParameter>
}

export interface IFunction {
    name: string
    arguments: Array<ITypeDescriptor & INamedParameter>
    returnType: ITypeDescriptor
}

export interface ILibraryData {
    structures: Array<IStructure>
    functions: Array<IFunction>
}

export function getStructureWrapperName(structureName: string) {
    return `${structureName}_wrapper`
}
