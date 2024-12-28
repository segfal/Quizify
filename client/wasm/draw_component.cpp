#include "draw_component.hpp"
#include <iostream>

namespace whiteboard {

// Vertex shader source
const char* vertex_shader_source = R"(
    #version 330 core
    layout (location = 0) in vec2 aPos;
    layout (location = 1) in vec4 aColor;
    
    uniform mat4 projection;
    
    out vec4 vertexColor;
    
    void main() {
        gl_Position = projection * vec4(aPos, 0.0, 1.0);
        vertexColor = aColor;
    }
)";

// Fragment shader source
const char* fragment_shader_source = R"(
    #version 330 core
    in vec4 vertexColor;
    out vec4 FragColor;
    
    void main() {
        FragColor = vertexColor;
    }
)";

DrawComponent::DrawComponent(int width, int height)
    : canvas_width(width)
    , canvas_height(height)
    , brush_size(5.0f)
    , current_color(1.0f, 0.0f, 0.0f, 1.0f)
    , is_drawing(false)
{
    projection = glm::ortho(0.0f, static_cast<float>(width), 
                           static_cast<float>(height), 0.0f, -1.0f, 1.0f);
    initializeGL();
}

DrawComponent::~DrawComponent() {
    glDeleteVertexArrays(1, &vao);
    glDeleteBuffers(1, &vbo);
    glDeleteProgram(shader_program);
}

void DrawComponent::initializeGL() {
    // Initialize GLEW
    glewExperimental = GL_TRUE;
    if (glewInit() != GLEW_OK) {
        std::cerr << "Failed to initialize GLEW" << std::endl;
        return;
    }

    createShaders();

    // Create VAO and VBO
    glGenVertexArrays(1, &vao);
    glGenBuffers(1, &vbo);

    // Set up vertex attributes
    glBindVertexArray(vao);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);

    // Position attribute
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    // Color attribute
    glVertexAttribPointer(1, 4, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(2 * sizeof(float)));
    glEnableVertexAttribArray(1);

    glBindVertexArray(0);
}

void DrawComponent::createShaders() {
    // Create vertex shader
    GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertex_shader_source, NULL);
    glCompileShader(vertexShader);

    // Create fragment shader
    GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragment_shader_source, NULL);
    glCompileShader(fragmentShader);

    // Create shader program
    shader_program = glCreateProgram();
    glAttachShader(shader_program, vertexShader);
    glAttachShader(shader_program, fragmentShader);
    glLinkProgram(shader_program);

    // Clean up
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    // Set projection matrix uniform
    glUseProgram(shader_program);
    GLint projLoc = glGetUniformLocation(shader_program, "projection");
    glUniformMatrix4fv(projLoc, 1, GL_FALSE, &projection[0][0]);
}

void DrawComponent::beginStroke(float x, float y, float pressure) {
    is_drawing = true;
    current_stroke.clear();
    current_stroke.push_back({
        glm::vec2(x, y),
        current_color,
        pressure
    });
}

void DrawComponent::addPoint(float x, float y, float pressure) {
    if (!is_drawing) return;

    current_stroke.push_back({
        glm::vec2(x, y),
        current_color,
        pressure
    });

    updateBuffers();
}

void DrawComponent::endStroke() {
    if (!is_drawing) return;

    is_drawing = false;
    if (!current_stroke.empty()) {
        strokes.push_back(current_stroke);
        undo_stack.push(current_stroke);
        redo_stack = std::stack<std::vector<Point>>();
    }
}

void DrawComponent::render() {
    glUseProgram(shader_program);
    glBindVertexArray(vao);

    for (const auto& stroke : strokes) {
        std::vector<GLfloat> geometry = generateStrokeGeometry(stroke);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, geometry.size() * sizeof(GLfloat), geometry.data(), GL_STATIC_DRAW);
        glDrawArrays(GL_TRIANGLE_STRIP, 0, geometry.size() / 6);
    }

    if (is_drawing && !current_stroke.empty()) {
        std::vector<GLfloat> geometry = generateStrokeGeometry(current_stroke);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, geometry.size() * sizeof(GLfloat), geometry.data(), GL_STATIC_DRAW);
        glDrawArrays(GL_TRIANGLE_STRIP, 0, geometry.size() / 6);
    }

    glBindVertexArray(0);
}

std::vector<GLfloat> DrawComponent::generateStrokeGeometry(const std::vector<Point>& stroke) {
    std::vector<GLfloat> geometry;
    if (stroke.size() < 2) return geometry;

    for (size_t i = 1; i < stroke.size(); ++i) {
        const auto& p1 = stroke[i - 1];
        const auto& p2 = stroke[i];

        // Calculate perpendicular vector
        glm::vec2 direction = glm::normalize(p2.position - p1.position);
        glm::vec2 normal(-direction.y, direction.x);
        
        // Calculate vertices for line segment
        glm::vec2 v1 = p1.position + normal * brush_size * p1.pressure;
        glm::vec2 v2 = p1.position - normal * brush_size * p1.pressure;
        glm::vec2 v3 = p2.position + normal * brush_size * p2.pressure;
        glm::vec2 v4 = p2.position - normal * brush_size * p2.pressure;

        // Add vertices with their colors
        // v1
        geometry.push_back(v1.x);
        geometry.push_back(v1.y);
        geometry.push_back(p1.color.r);
        geometry.push_back(p1.color.g);
        geometry.push_back(p1.color.b);
        geometry.push_back(p1.color.a);

        // v2
        geometry.push_back(v2.x);
        geometry.push_back(v2.y);
        geometry.push_back(p1.color.r);
        geometry.push_back(p1.color.g);
        geometry.push_back(p1.color.b);
        geometry.push_back(p1.color.a);

        // v3
        geometry.push_back(v3.x);
        geometry.push_back(v3.y);
        geometry.push_back(p2.color.r);
        geometry.push_back(p2.color.g);
        geometry.push_back(p2.color.b);
        geometry.push_back(p2.color.a);

        // v4
        geometry.push_back(v4.x);
        geometry.push_back(v4.y);
        geometry.push_back(p2.color.r);
        geometry.push_back(p2.color.g);
        geometry.push_back(p2.color.b);
        geometry.push_back(p2.color.a);
    }

    return geometry;
}

void DrawComponent::setColor(float r, float g, float b, float a) {
    current_color = glm::vec4(r, g, b, a);
}

void DrawComponent::setBrushSize(float size) {
    brush_size = size;
}

void DrawComponent::clear() {
    strokes.clear();
    current_stroke.clear();
    undo_stack = std::stack<std::vector<Point>>();
    redo_stack = std::stack<std::vector<Point>>();
    updateBuffers();
}

void DrawComponent::undo() {
    if (strokes.empty() || undo_stack.empty()) return;
    
    redo_stack.push(undo_stack.top());
    undo_stack.pop();
    strokes.pop_back();
    updateBuffers();
}

void DrawComponent::redo() {
    if (redo_stack.empty()) return;
    
    strokes.push_back(redo_stack.top());
    undo_stack.push(redo_stack.top());
    redo_stack.pop();
    updateBuffers();
}

void DrawComponent::updateBuffers() {
    // This method can be expanded to handle more complex buffer updates if needed
    render();
}

} // namespace whiteboard 