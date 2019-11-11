#include "test_library.h"

#include <iostream>

void hello() { std::cout << "Hello, World!" << std::endl; }

int get_five() { return 5; }
int duplicate(const int original) { return original * 2; }