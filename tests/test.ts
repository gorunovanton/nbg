import {Library} from "../output/library";
import * as path from 'path'
import * as os from 'os'

const libraryExtension = os.platform() === 'win32' ? '.dll' : '.so';
// const testLibraryPath = path.join(process.cwd(), 'cmake-build-release', `test_library${libraryExtension}`);
const testLibraryPath = path.join(process.cwd(), 'cmake-build-debug', `test_library${libraryExtension}`);

test('Library load', () => {
    const lib = new Library(testLibraryPath);
    expect(lib).toBeDefined()
});

describe('Library usage', () => {
    let lib: Library;

    beforeAll(() => {
        lib = new Library(testLibraryPath);
    });

    describe('Trivial functions', () => {
        test('Call simplest function', () => {
            lib.hello();
        });

        test('Call function with integer return value', () => {
            expect(lib.getFive()).toBe(5);
        });

        test('Call function with single integer argument', () => {
            const input = 5;
            expect(lib.duplicate(input)).toBe(input * 2);
        });
    });

    describe('Structures', () => {
        let structClass: typeof lib.addon.factors_s_wrapper;

        beforeAll(() => {
            structClass = lib.addon.factors_s_wrapper;
        });

        test('Structure wrapper exists', () => {
            expect(structClass).toBeDefined();
        });

        test('Structure size is defined', () => {
            expect(structClass.getSize).toBeDefined();
        });

        test('Structure size is valid', () => {
            const int32Size = 4;
            expect(structClass.getSize()).toEqual(int32Size * 2);
        });

        test('Create structure from scratch', () => {
            const structInstance = new structClass();
            expect(structInstance).toBeDefined();
        });

        test('Structure members are defined', () => {
            const structInstance = new structClass();
            expect(structInstance.base).toBeDefined();
            expect(structInstance.multiplier).toBeDefined();
        });

        test('Structure members are assignable and accessible', () => {
            const structInstance = new structClass();
            structInstance.base = 11;
            structInstance.multiplier = 2;
            expect(structInstance.base).toEqual(11);
            expect(structInstance.multiplier).toEqual(2);
        });

        test('Create structure with initial values', () => {
            const baseValue = 2;
            const multiplierValue = 3;
            const baseNewValue = 42;

            const structInstance = new structClass({base: baseValue, multiplier: multiplierValue});
            expect(structInstance.base).toEqual(baseValue);
            expect(structInstance.multiplier).toEqual(multiplierValue);

            structInstance.base = baseNewValue;
            expect(structInstance.base).toEqual(baseNewValue);
            expect(structInstance.multiplier).toEqual(multiplierValue);
        });

        test('Create structure using Buffer', () => {
            const baseValue = 2;
            const multiplierValue = 3;

            const structureSize = structClass.getSize();
            const structInstance = new structClass(Buffer.allocUnsafe(structureSize));

            expect(structInstance).toBeDefined();
            structInstance.base = baseValue;
            structInstance.multiplier = multiplierValue;

            expect(structInstance.base).toEqual(baseValue);
            expect(structInstance.multiplier).toEqual(multiplierValue);
        });

        test('Use structure as function argument', () => {
            const baseValue = 2;
            const multiplierValue = 3;

            const structInstance = new structClass({base: baseValue, multiplier: multiplierValue});
            expect(lib.multiply(structInstance)).toEqual(baseValue * multiplierValue);
        });

        test('Get structure from function', () => {
            const baseValue = 6;
            const multiplierValue = 7;

            const structInstance = lib.createFactors();
            expect(structInstance).toBeDefined();
            expect(structInstance.base).toEqual(baseValue);
            expect(structInstance.multiplier).toEqual(multiplierValue);
        });
    });

    describe('Pointers', () => {
        test('Pointer wrapper is available', () => {
            expect(lib.addon.Pointer).toBeDefined();
        });

        test('Create pointer from buffer', () => {
            const pointerSize = 8; // TODO move to addon
            const buffer = Buffer.alloc(pointerSize);
            const ptr = new lib.addon.Pointer(buffer);
            expect(ptr).toBeDefined();
        });

        test('Call function returning pointer', () => {
            const ptr = lib.makeIntPtr();
            expect(ptr).toBeDefined();
        });

        test('Call function with pointer argument', () => {
            const ptr = lib.makeIntPtr();
            console.log('ptr.getInt32()', ptr.getInt32());
            expect(ptr.getInt32()).toEqual(11);

            console.log(ptr.asBuffer());
            expect(lib.dereferenceInt(ptr)).toEqual(11);
            console.log(ptr)
        });
    });
});
