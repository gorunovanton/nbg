const projectName = 'binding';
const sourceFilename = 'binding.cpp';

export const template = `
cmake_minimum_required(VERSION 3.15)

project (${projectName})
include_directories(\${CMAKE_JS_INC})

include(conanbuildinfo.cmake)
conan_basic_setup()

file(GLOB SOURCE_FILES ${sourceFilename})
add_library(\${PROJECT_NAME} SHARED \${SOURCE_FILES} \${CMAKE_JS_SRC})
set_target_properties(\${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(\${PROJECT_NAME} \${CMAKE_JS_LIB})

# Include N-API wrappers
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY \${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
string(REPLACE "\\n" "" NODE_ADDON_API_DIR \${NODE_ADDON_API_DIR})
string(REPLACE "\\"" "" NODE_ADDON_API_DIR \${NODE_ADDON_API_DIR})
target_include_directories(\${PROJECT_NAME} PRIVATE \${NODE_ADDON_API_DIR})
target_link_libraries(\${PROJECT_NAME} \${CONAN_LIBS})
`;
