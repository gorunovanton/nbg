#include <iostream>

#include <napi.h>

#include <boost/dll.hpp>
#include <boost/dll/import.hpp>         // for dll::import
#include <boost/dll/shared_library.hpp> // for dll::shared_library

class Library : public Napi::ObjectWrap<Library> {
public:
  static void Init(Napi::Env env, Napi::Object exports);
  Library(const Napi::CallbackInfo &info);

  //NBG_FUNCTION_DECLARATIONS

private:
  static Napi::FunctionReference constructor;

  boost::dll::shared_library m_library;
}; // class Library

Napi::FunctionReference Library::constructor;

Library::Library(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Library>(info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  if (info.Length() != 1) {
    Napi::TypeError::New(env, "Library take 3 arguments")
        .ThrowAsJavaScriptException();
    return;
  }

  if (!info[0].IsString()) {
    Napi::TypeError::New(env, "Library path should be string")
        .ThrowAsJavaScriptException();
    return;
  }

  const auto library_path = info[0].ToString().Utf8Value();
  try {
    m_library.load(library_path);
  } catch (const std::exception &e) {
    std::cout << "WTF " << e.what() << std::endl;
  }
}

void Library::Init(const Napi::Env env, Napi::Object exports) {
  const Napi::HandleScope scope(env);

  const auto func = DefineClass(env, "Library",
                                {
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