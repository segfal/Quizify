#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <emscripten/webgl.h>
#include "draw_component.hpp"

using namespace emscripten;

// Wrapper class to handle WebGL context and drawing component
class WhiteboardWrapper {
private:
    std::unique_ptr<whiteboard::DrawComponent> draw_component;
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context;

public:
    WhiteboardWrapper(const std::string& canvasId, int width, int height) {
        // Set up WebGL context
        EmscriptenWebGLContextAttributes attrs;
        emscripten_webgl_init_context_attributes(&attrs);
        attrs.alpha = true;
        attrs.depth = true;
        attrs.stencil = true;
        attrs.antialias = true;
        attrs.premultipliedAlpha = true;
        attrs.preserveDrawingBuffer = false;
        attrs.powerPreference = EM_WEBGL_POWER_PREFERENCE_DEFAULT;
        attrs.failIfMajorPerformanceCaveat = false;
        attrs.majorVersion = 2;
        attrs.minorVersion = 0;
        attrs.enableExtensionsByDefault = true;

        // Get canvas element and create WebGL context
        context = emscripten_webgl_create_context(canvasId.c_str(), &attrs);
        if (context < 0) {
            throw std::runtime_error("Failed to create WebGL context");
        }

        // Make the context current
        emscripten_webgl_make_context_current(context);

        // Create drawing component
        draw_component = std::make_unique<whiteboard::DrawComponent>(width, height);
    }

    ~WhiteboardWrapper() {
        draw_component.reset();
        emscripten_webgl_destroy_context(context);
    }

    // Drawing methods
    void beginStroke(float x, float y, float pressure = 1.0f) {
        draw_component->beginStroke(x, y, pressure);
    }

    void addPoint(float x, float y, float pressure = 1.0f) {
        draw_component->addPoint(x, y, pressure);
    }

    void endStroke() {
        draw_component->endStroke();
    }

    // State management
    void setColor(float r, float g, float b, float a = 1.0f) {
        draw_component->setColor(r, g, b, a);
    }

    void setBrushSize(float size) {
        draw_component->setBrushSize(size);
    }

    void clear() {
        draw_component->clear();
    }

    // Undo/Redo
    void undo() {
        draw_component->undo();
    }

    void redo() {
        draw_component->redo();
    }

    // Render frame
    void render() {
        draw_component->render();
    }
};

// Emscripten bindings
EMSCRIPTEN_BINDINGS(whiteboard_module) {
    class_<WhiteboardWrapper>("Whiteboard")
        .constructor<std::string, int, int>()
        .function("beginStroke", &WhiteboardWrapper::beginStroke)
        .function("addPoint", &WhiteboardWrapper::addPoint)
        .function("endStroke", &WhiteboardWrapper::endStroke)
        .function("setColor", &WhiteboardWrapper::setColor)
        .function("setBrushSize", &WhiteboardWrapper::setBrushSize)
        .function("clear", &WhiteboardWrapper::clear)
        .function("undo", &WhiteboardWrapper::undo)
        .function("redo", &WhiteboardWrapper::redo)
        .function("render", &WhiteboardWrapper::render);
} 