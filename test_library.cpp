#include "test_library.h"

#include <iostream>

void hello() { std::cout << "Hello, World!" << std::endl; }

int get_five() { return 5; }
int duplicate(const int original) { return original * 2; }

int multiply(const factors_s sources) {
  return sources.base * sources.multiplier;
}

factors_s create_factors() { return factors_s{6, 7}; }

int *makeIntPtr() {
  const auto ptr = new int;
  *ptr = 11;
  return ptr;
}
int dereferenceInt(const int *const value) { return *value; }

int multiplyFromPtr(const factors_s *const sources) {
  return sources->base * sources->multiplier;
}

void fill_int_ptr_holder(int_ptr_holder_s *const destination) {
  destination->ptr = new int;
  *(destination->ptr) = 42;
}