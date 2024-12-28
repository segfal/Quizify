#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <vector>
#include <memory>
#include <string>
#include <stack>
#include <nlohmann/json.hpp>

namespace whiteboard {

struct Point {
    glm::vec2 position;
    glm::vec4 color;
    float pressure;
};

class DrawComponent {
public:
    DrawComponent(int width, int height);
    ~DrawComponent();

    // Drawing methods
    void beginStroke(float x, float y, float pressure = 1.0f);
    void addPoint(float x, float y, float pressure = 1.0f);
    void endStroke();
    
    // Rendering
    void render();
    
    // State management
    void setColor(float r, float g, float b, float a = 1.0f);
    void setBrushSize(float size);
    void clear();
    
    // Undo/Redo
    void undo();
    void redo();

private:
    // OpenGL resources
    GLuint vao;
    GLuint vbo;
    GLuint shader_program;
    
    // Drawing state
    std::vector<Point> current_stroke;
    std::vector<std::vector<Point>> strokes;
    std::stack<std::vector<Point>> undo_stack;
    std::stack<std::vector<Point>> redo_stack;
    
    // Brush properties
    glm::vec4 current_color;
    float brush_size;
    bool is_drawing;
    
    // Canvas properties
    int canvas_width;
    int canvas_height;
    glm::mat4 projection;

    // Helper methods
    void initializeGL();
    void createShaders();
    void updateBuffers();
    std::vector<GLfloat> generateStrokeGeometry(const std::vector<Point>& stroke);
};

} // namespace whiteboard 