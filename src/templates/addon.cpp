#include <iostream>

#include <napi.h>

#include <boost/dll.hpp>
#include <boost/dll/import.hpp>         // for dll::import
#include <boost/dll/shared_library.hpp> // for dll::shared_library

//NBG_STRUCTURES_DECLARATIONS
//NBG_STRUCTURE_DEFINITIONS

class Pointer : public Napi::ObjectWrap<Pointer> {
public:
  Pointer(const Napi::CallbackInfo &info);
  static void Init(Napi::Env env, Napi::Object exports);

  static Napi::Value FromNativeValue(const Napi::Env env, void * ptr);

  static Napi::Object New(const Napi::Buffer<std::size_t> arg) {
      const auto env = arg.Env();
      Napi::EscapableHandleScope scope(env);
//      return scope.Escape(constructor.New({arg})).As<Napi::Object>();
      return constructor.New({arg}).As<Napi::Object>();
  }

  Napi::Value asBuffer(const Napi::CallbackInfo &info) {
    const auto env = info.Env();
//    Napi::EscapableHandleScope scope(env);
//    return scope.Escape(m_buffer);

      Napi::HandleScope scope(env);
      return m_buffer;
  }

  template<typename T = void*>
  T asPtr() { return reinterpret_cast<T>(reinterpret_cast<void *>(*(m_buffer.Data()))); }

private:
  static Napi::FunctionReference constructor;

  Napi::Buffer<std::size_t> m_buffer;
}; // class pointer

class Library : public Napi::ObjectWrap<Library> {
public:
  static void Init(Napi::Env env, Napi::Object exports);
  Library(const Napi::CallbackInfo &info);

  //NBG_FUNCTION_DECLARATIONS

private:
  static Napi::FunctionReference constructor;

  boost::dll::shared_library m_library;
}; // class Library

Napi::FunctionReference Pointer::constructor;

Pointer::Pointer(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<Pointer>(info) {
    const auto env = info.Env();
    const Napi::HandleScope scope(env);

  if (info.Length() != 1) {
    throw Napi::Error::New(env, "Pointer take only one argument");
  }

  if (!info[0].IsBuffer()) {
    // TODO hold reference to object to prevent its garbage collection
    throw Napi::TypeError::New(env, "Pointer can take only buffer as argument");
  }

  auto input_buffer = info[0].As<Napi::Buffer<std::size_t>>();
  m_buffer = Napi::Buffer<std::size_t>::New(env, 1);
  *(m_buffer.Data()) = reinterpret_cast<size_t>(input_buffer.Data());
}

void Pointer::Init(const Napi::Env env, Napi::Object exports) {
  const Napi::HandleScope scope(env);

  const auto func = DefineClass(env, "Pointer", {
      InstanceMethod("asBuffer", &Pointer::asBuffer),
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();
  exports.Set("Pointer", func);
}

Napi::Value Pointer::FromNativeValue(const Napi::Env env, void * ptr) {
    Napi::EscapableHandleScope scope(env);

    const auto buffer = Napi::Buffer<std::size_t>::New(env, 1);
    *(buffer.Data()) = reinterpret_cast<size_t>(ptr);
    return scope.Escape(Pointer::New(buffer)).As<Napi::Object>();
}

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
  Pointer::Init(env, exports);

  //NBG_STRUCTURE_WRAPPERS_INIT

  return exports;
}

NODE_API_MODULE(addon, Init)