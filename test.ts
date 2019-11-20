import {Library} from "./output/library";

function main() {
    const lib = new Library("C:\\dev\\nbg\\cmake-build-release\\test_library.dll");
    console.log('Finished');
    console.log('lib.hello()', lib.hello());
    console.log('lib.getFive()', lib.getFive());
    console.log('lib.duplicate()', lib.duplicate(5));
    console.log('lib.addon.factors_s_wrapper: ', lib.addon.factors_s_wrapper);

    const factors = new lib.addon.factors_s_wrapper({base: 2, multiplier: 3});
    console.log('factors', factors);
    console.log('factors.base', factors.base);
    factors.base = 11;
    console.log('factors.base', factors.base);

}

main();