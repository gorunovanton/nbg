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
            returnType: 'void',
            arguments: []
        },
        {
            name: 'get_five',
            returnType: 'int32',
            arguments: []
        },
        {
            name: 'duplicate',
            returnType: 'int32',
            arguments: [{
                name: 'original',
                type: 'int32'
            }]
        }
    ]
};

