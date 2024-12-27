# Quizify

A modern quiz application with high-performance whiteboard capabilities, built with Next.js 13+ and C++ WebAssembly optimization.

## 🚀 Features

- 📝 Create and take quizzes in real-time
- ✏️ High-performance whiteboard with C++ optimization
- 🎯 Multiple quiz types support
- 🌙 Dark/Light mode
- 📱 Responsive design
- ⚡ WebAssembly-powered drawing
- 🗄️ S3 media storage
- 🔒 Secure authentication
- 📊 Real-time progress tracking

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **State Management**: React Context, SWR
- **Performance**: C++ WebAssembly
- **Storage**: AWS S3
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18.0.0 or later
- C++ compiler (Clang or GCC)
- Emscripten SDK
- AWS Account (for S3 integration)
- npm

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quizify.git
   cd quizify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Emscripten SDK**
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the following variables:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_s3_bucket
   ```

5. **Build WebAssembly modules**
   ```bash
   cd wasm
   make build
   cd ..
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
quizify/
├── client/                # Frontend application
│   ├── src/
│   │   ├── app/          # Next.js 13+ App Router
│   │   ├── components/   # React components
│   │   ├── lib/         # Utilities and hooks
│   │   └── wasm/        # WebAssembly bridge
│   ├── public/          # Static assets
│   └── docs/           # Documentation
├── wasm/               # C++ WebAssembly source
│   ├── src/           # C++ implementation
│   ├── include/       # Header files
│   └── bridge/        # C++/JS bridge
└── scripts/           # Build scripts
```

## 🎨 Whiteboard Features

- Real-time drawing with < 16ms latency
- Vector-based rendering
- Shape recognition
- Multi-layer support
- Infinite canvas
- Undo/Redo functionality
- Smart stroke smoothing

## 🔜 Future Implementations

### WebAssembly Optimization
- SIMD operations for vector calculations
- Multi-threaded rendering
- Memory pooling
- Optimized geometry calculations

### S3 Integration
- Automatic state backup
- Asset management
- CDN integration
- Delta compression

## 🔑 Critical Functionality

See [CRITICAL_FUNCTIONALITY.md](./client/docs/CRITICAL_FUNCTIONALITY.md) for detailed documentation of critical system components.

## 🎨 Styling System

See [STYLING.md](./client/docs/STYLING.md) for our styling guidelines and system.

## 🏛️ Architecture

See [SYSTEM_DESIGN.md](./client/docs/SYSTEM_DESIGN.md) for detailed system architecture.

## 🔄 Development Workflow

1. Create feature branch
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make changes and test
   ```bash
   npm run test
   npm run lint
   ```

3. Build and verify
   ```bash
   npm run build
   ```

## 📦 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to production**
   ```bash
   npm run deploy
   ```

## 🔜 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
