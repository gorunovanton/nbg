#include <iostream>

#include <napi.h>

#include <boost/dll/import.hpp>         // for dll::import
#include <boost/dll/shared_library.hpp> // for dll::shared_library
#include <boost/dll.hpp>

class Library : public Napi::ObjectWrap<Library> {
public:
  static void Init(Napi::Env env, Napi::Object exports);
  Library(const Napi::CallbackInfo &info);

  //NBG_FUNCTION_DECLARATIONS

private:
  static Napi::FunctionReference constructor;
}; // class Library

Napi::FunctionReference Library::constructor;

Library::Library(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Library>(info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  const auto library_path = "C:\\dev\\nbg\\cmake-build-release\\test_library.dll";
  try {
//    const auto result = LoadLibraryA(library_path);
//    std::cout << "Result: " << result << std::endl;
//    if (result == nullptr){
//      std::cout << "Last error " << GetLastError() << std::endl;
//    }

    boost::dll::shared_library library(library_path);
  } catch (const std::exception &e) {
      std::cout << "WTF " << e.what() <<  std::endl;
  }
}

void Library::Init(const Napi::Env env, Napi::Object exports) {
  const Napi::HandleScope scope(env);

  const auto func = DefineClass(env, "Library", {
    //NBG_FUNCTION_ENUMERATION
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();
  exports.Set("Library", func);
}

//NBG_FUNCTION_DEFINITIONS

Napi::Object Init(const Napi::Env env, const Napi::Object exports) {
  Library::Init(env, exports);
  return exports;
}

NODE_API_MODULE(addon, Init)