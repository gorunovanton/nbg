import {Library} from "./output/library";

function main() {
    const lib = new Library("C:\\dev\\nbg\\cmake-build-release\\test_library.dll");
    console.log('Finished');
    console.log('lib.hello()', lib.hello());
    console.log("lib.getFive()", lib.getFive());
}

main();