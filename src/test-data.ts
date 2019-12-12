import {ILibraryData} from "./common";

export const testLibraryData: ILibraryData = {
    structures: [{
        name: 'factors_s',
        members: [
            {
                name: 'base',
                type: 'int32'
            },
            {
                name: 'multiplier',
                type: 'int32'
            }
        ]
    }],
    functions: [
        {
            name: 'hello',
            returnType: {type: 'void'},
            arguments: []
        },
        {
            name: 'get_five',
            returnType: {type: 'int32'},
            arguments: []
        },
        {
            name: 'duplicate',
            returnType: {type: 'int32'},
            arguments: [{
                name: 'original',
                type: 'int32'
            }]
        },
        {
            name: 'multiply',
            returnType: {type: 'int32'},
            arguments: [{
                name: 'sources',
                type: 'structure',
                structureName: 'factors_s'
            }
            ]
        },
        {
            name: 'create_factors',
            returnType: {type: 'structure', structureName: 'factors_s'},
            arguments: []
        },
        {
            name: 'makeIntPtr',
            returnType: {
                type: 'pointer',
                underlyingType: {type: 'int32'},
                mutable: true
            },
            arguments: []
        },
        {
            name: 'dereferenceInt',
            returnType: {type: 'int32'},
            arguments: [{
                name: "value",
                type: 'pointer',
                underlyingType: {
                    type: 'int32'
                },
                mutable: false
            }]
        },
        {
            name: 'multiplyFromPtr',
            returnType: {type: 'int32'},
            arguments: [{
                name: "sources",
                type: 'pointer',
                underlyingType: {
                    type: 'structure',
                    structureName: 'factors_s'
                },
                mutable: false
            }]
        },
    ]
};

