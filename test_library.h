#ifndef NBG_LIBRARY_H
#define NBG_LIBRARY_H

#define API_EXPORT __declspec(dllexport)

#ifdef __cplusplus
extern "C" {
#endif

API_EXPORT void hello();
API_EXPORT int get_five();

#ifdef __cplusplus
}
#endif

#endif // NBG_LIBRARY_H