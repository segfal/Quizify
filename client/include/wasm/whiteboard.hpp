#pragma once

#include <vector>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <string>
#include <cmath>
#include <memory>





struct Point {
    float x;
    float y;
};

struct Rect {
    float x;
    float y;
    float width;
    float height;
};


enum class ShapeType {
   FREEHAND,
   RECTANGLE,
   CIRCLE,
   LINE,
   TRIANGLE
};



