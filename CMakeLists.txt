cmake_minimum_required(VERSION 3.15)
project(test_library)

set(CMAKE_CXX_STANDARD 17)

add_library(test_library SHARED test_library.cpp test_library.h)