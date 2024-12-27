# Critical Functionality Documentation

## Critical Files and Components

### 1. Authentication System (`/lib/auth/`)
**🚨 CRITICAL**: Changes here can break user sessions and security
```typescript
// Design Pattern: Singleton Pattern for Auth Context
// Purpose: Manages user authentication state globally
auth/
├── AuthContext.tsx      # Global auth state
├── AuthProvider.tsx     # Auth state provider
└── authUtils.ts        # Authentication utilities
```

### 2. Quiz Engine (`/lib/quiz-engine/`)
**🚨 CRITICAL**: Core quiz functionality
```typescript
// Design Pattern: Strategy Pattern for Quiz Types
quiz-engine/
├── QuizContext.tsx     # Quiz state management
├── quizTypes.ts       # Quiz type definitions
└── quizValidation.ts  # Quiz validation logic
```

### 3. Data Management (`/lib/data/`)
**🚨 CRITICAL**: Data persistence and state management
```typescript
// Design Pattern: Repository Pattern
data/
├── api.ts            # API client
├── storage.ts        # Local storage management
└── cache.ts         # Caching implementation
```

## Critical Functions

### Authentication
```typescript
// 🚨 CRITICAL: User Session Management
async function validateSession(token: string): Promise<boolean>
async function refreshToken(refreshToken: string): Promise<AuthTokens>
async function handleAuthError(error: AuthError): Promise<void>
```

### Quiz Engine
```typescript
// 🚨 CRITICAL: Quiz State Management
function validateQuizSubmission(answers: QuizAnswers): boolean
function calculateQuizScore(responses: UserResponses): Score
function handleQuizTimeout(quizId: string): void
```

### Data Persistence
```typescript
// 🚨 CRITICAL: Data Integrity
async function syncQuizData(quizData: QuizData): Promise<void>
async function validateDataIntegrity(data: any): boolean
async function handleDataConflict(serverData: Data, localData: Data): Promise<Data>
```

## Design Patterns Used

### 1. Singleton Pattern
- **Where**: Authentication Context
- **Purpose**: Ensure single instance of auth state
- **Critical Files**: `AuthContext.tsx`, `AuthProvider.tsx`

### 2. Strategy Pattern
- **Where**: Quiz Type Implementation
- **Purpose**: Different quiz types with same interface
- **Critical Files**: `quizTypes.ts`, `QuizContext.tsx`

### 3. Repository Pattern
- **Where**: Data Layer
- **Purpose**: Abstract data source operations
- **Critical Files**: `api.ts`, `storage.ts`

### 4. Observer Pattern
- **Where**: Real-time Updates
- **Purpose**: Handle real-time quiz state changes
- **Critical Files**: `QuizContext.tsx`, `RealtimeProvider.tsx`

## Future Implementation Considerations

### 1. WebAssembly (C++) Integration
```cpp
// Planned Implementation
wasm/
├── whiteboard/              # Whiteboard engine in C++
│   ├── renderer.cpp        # High-performance rendering
│   ├── stroke_handler.cpp  # Stroke management
│   ├── geometry.cpp        # Geometric calculations
│   └── events.cpp         # Event handling
├── optimization/
│   ├── vector_ops.cpp     # Vector operations
│   └── matrix_ops.cpp     # Matrix transformations
└── bridge/
    ├── whiteboard_bridge.cpp  # C++ to JS bridge
    └── event_bridge.cpp      # Event system bridge

// Core Whiteboard Functions
class WhiteboardEngine {
    void handleStroke(const StrokeData& stroke);
    void optimizeRendering(const CanvasState& state);
    void processGeometry(const ShapeData& shape);
    void handleTransform(const TransformMatrix& matrix);
};

// Performance-Critical Operations
namespace VectorOps {
    void calculateBezierCurve(const std::vector<Point>& points);
    void optimizeStrokeData(StrokeData& stroke);
    void performMatrixTransformation(const Matrix& m);
}
```

### Critical Whiteboard Functions
```typescript
// 🚨 CRITICAL: Whiteboard Core Operations
interface WhiteboardOperations {
  // Real-time stroke handling
  handleStroke(points: Point[]): void;
  
  // Canvas state management
  updateCanvasState(state: CanvasState): void;
  
  // Geometric operations
  processShape(shape: Shape): void;
  
  // Transform operations
  applyTransform(transform: Transform): void;
}

// Performance-critical computations
interface ComputationEngine {
  // Bezier curve calculations
  calculateCurve(points: Point[]): CurveData;
  
  // Stroke optimization
  optimizeStrokes(strokes: Stroke[]): OptimizedStrokes;
  
  // Matrix operations
  computeTransform(matrix: Matrix): TransformedData;
}
```

### WebAssembly Bridge Implementation
```typescript
// Bridge between C++ and TypeScript
class WasmBridge {
  // Initialize WebAssembly module
  async initializeWasm(): Promise<void>;
  
  // Handle high-performance operations
  delegateToWasm(operation: Operation): Promise<Result>;
  
  // Memory management
  handleMemoryAllocation(size: number): Pointer;
  freeMemory(pointer: Pointer): void;
}
```

### 2. S3 Integration
```typescript
// Planned Implementation
storage/
├── s3Client.ts       # S3 client configuration
├── uploadManager.ts  # Upload management
└── mediaHandler.ts   # Media file handling
```

## Critical Dependencies
```json
{
  "critical": {
    "@aws-sdk/client-s3": "latest",
    "next-auth": "latest",
    "swr": "latest",
    "zod": "latest"
  }
}
```

## Error Handling for Critical Functions

### Authentication Errors
```typescript
try {
  await validateSession(token)
} catch (error) {
  if (error instanceof AuthenticationError) {
    await handleAuthError(error)
  }
  // Force re-authentication
}
```

### Data Integrity Errors
```typescript
try {
  await syncQuizData(quizData)
} catch (error) {
  if (error instanceof DataIntegrityError) {
    await handleDataConflict(serverData, localData)
  }
  // Fallback to local data
}
``` 