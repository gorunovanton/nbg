#ifndef NBG_LIBRARY_H
#define NBG_LIBRARY_H

#define API_EXPORT __declspec(dllexport)

#ifdef __cplusplus
extern "C" {
#endif

struct factors_s {
  int base;
  int multiplier;
};

API_EXPORT void hello();
API_EXPORT int get_five();
API_EXPORT int duplicate(int original);
API_EXPORT int multiply(factors_s sources);


#ifdef __cplusplus
}
#endif

#endif // NBG_LIBRARY_H