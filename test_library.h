#ifndef NBG_LIBRARY_H
#define NBG_LIBRARY_H
#if defined(_WIN32) || defined(WIN32)
#define API_EXPORT __declspec(dllexport)
#elif defined(unix)
#define API_EXPORT __attribute__ ((visibility ("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

struct factors_s {
  int base;
  int multiplier;
};

struct int_ptr_holder_s {
    int *ptr;
};

API_EXPORT void hello();
API_EXPORT int get_five();
API_EXPORT int duplicate(int original);
API_EXPORT int multiply(factors_s sources);
API_EXPORT factors_s create_factors();
API_EXPORT int* makeIntPtr();
API_EXPORT int dereferenceInt(const int *value);
API_EXPORT int multiplyFromPtr(const factors_s * sources);
API_EXPORT void fill_int_ptr_holder(int_ptr_holder_s *destination);

#ifdef __cplusplus
}
#endif

#endif // NBG_LIBRARY_H