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
        }
    ]
};

