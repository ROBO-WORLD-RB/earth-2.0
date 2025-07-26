@echo off
REM EARTH AI Brain Studio - GitHub Deployment Script (Windows)
REM Pushes all files to https://github.com/ROBO-WORLD-RB/earth-2.0

echo 🚀 EARTH AI Brain Studio - GitHub Deployment
echo =============================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the EARTH-APP directory.
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/download/windows
    pause
    exit /b 1
)

echo 📋 Repository: https://github.com/ROBO-WORLD-RB/earth-2.0
echo 📁 Current directory: %CD%
echo.

REM Initialize git if not already done
if not exist ".git" (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

REM Add remote origin
echo 🔗 Setting up remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/ROBO-WORLD-RB/earth-2.0.git
echo ✅ Remote repository configured

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo 📝 Creating .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Production build
        echo dist/
        echo build/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # IDE files
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS files
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Logs
        echo logs/
        echo *.log
        echo.
        echo # Runtime data
        echo pids/
        echo *.pid
        echo *.seed
        echo *.pid.lock
        echo.
        echo # Coverage directory used by tools like istanbul
        echo coverage/
        echo.
        echo # Temporary folders
        echo tmp/
        echo temp/
        echo.
        echo # Optional npm cache directory
        echo .npm
        echo.
        echo # Optional eslint cache
        echo .eslintcache
        echo.
        echo # Microbundle cache
        echo .rpt2_cache/
        echo .rts2_cache_cjs/
        echo .rts2_cache_es/
        echo .rts2_cache_umd/
        echo.
        echo # Optional REPL history
        echo .node_repl_history
        echo.
        echo # Output of 'npm pack'
        echo *.tgz
        echo.
        echo # Yarn Integrity file
        echo .yarn-integrity
        echo.
        echo # parcel-bundler cache
        echo .cache
        echo .parcel-cache
        echo.
        echo # Next.js build output
        echo .next
        echo.
        echo # Nuxt.js build / generate output
        echo .nuxt
        echo.
        echo # Storybook build outputs
        echo .out
        echo .storybook-out
        echo.
        echo # Temporary folders
        echo .tmp/
        echo .temp/
    ) > .gitignore
    echo ✅ .gitignore created
)

REM Stage all files
echo 📦 Staging all files...
git add .
echo ✅ All files staged

REM Check if there are changes to commit
git diff --staged --quiet
if errorlevel 1 (
    REM Create commit
    echo 💾 Creating commit...
    git commit -m "🚀 EARTH AI Brain Studio v2.0 - Complete Production Release

✨ Major Features Implemented:
• 🧠 AI Personality Manager - Create and switch between custom AI assistants
• 🔍 Smart Search - Advanced conversation search with filters and highlighting
• 📝 Message Templates - Reusable patterns with variables for common tasks
• 🎤 Voice Integration - Speech-to-text, text-to-speech, and voice commands
• 📊 Conversation Analytics - Detailed usage statistics and insights
• 📦 Export/Import System - Complete data backup and restore functionality
• ⌨️ Keyboard Shortcuts - Customizable shortcuts for power users
• ⚡ Command Palette - Quick access to all features with fuzzy search

🎨 User Experience Enhancements:
• Feature discovery tour for new users
• Multiple access methods for every feature
• Enhanced UI with gradients and animations
• Responsive design for all devices
• Dark/light theme support
• Accessibility improvements

🛡️ Production-Ready Features:
• Error boundaries for graceful error handling
• Performance monitoring and Web Vitals tracking
• Privacy-friendly analytics system
• Advanced service worker for offline functionality
• Security headers and CSP configuration
• Optimized build process with code splitting
• PWA support with installation prompts

🔧 Technical Implementation:
• TypeScript throughout for type safety
• React 18 with modern hooks and patterns
• Vite for fast development and optimized builds
• Firebase for authentication and real-time features
• Google Gemini AI for advanced language processing
• Local storage for data persistence
• Web Speech API for voice features
• PDF.js for document processing

📚 Comprehensive Documentation:
• Complete setup and deployment guides
• Feature access documentation
• API integration instructions
• Troubleshooting resources
• Performance optimization guides

🚀 Deployment Ready:
• Vercel configuration included
• Environment variables documented
• Production build optimization
• Global CDN distribution ready
• HTTPS and security configured

This release transforms EARTH AI into a professional-grade AI workspace with enterprise-level features and reliability."

    echo ✅ Commit created successfully
) else (
    echo ℹ️  No changes to commit. Repository is up to date.
)

REM Set main branch
echo 🌿 Setting main branch...
git branch -M main
echo ✅ Main branch configured

REM Push to GitHub
echo 🚀 Pushing to GitHub...
echo 📡 Repository: https://github.com/ROBO-WORLD-RB/earth-2.0

git push -u origin main
if errorlevel 1 (
    echo.
    echo ❌ Push failed. This might be due to:
    echo 1. Authentication issues - make sure you're logged into GitHub
    echo 2. Repository permissions - ensure you have write access
    echo 3. Network connectivity issues
    echo.
    echo 🔧 Try these solutions:
    echo 1. Configure Git credentials:
    echo    git config --global user.name "Your Name"
    echo    git config --global user.email "your.email@example.com"
    echo.
    echo 2. Use GitHub CLI for authentication:
    echo    gh auth login
    echo.
    echo 3. Or push manually with authentication:
    echo    git push -u origin main
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 SUCCESS! EARTH AI Brain Studio deployed to GitHub!
    echo ==============================================
    echo.
    echo 📍 Repository URL: https://github.com/ROBO-WORLD-RB/earth-2.0
    echo.
    echo 🚀 Next Steps:
    echo 1. Visit your GitHub repository to verify all files are present
    echo 2. Deploy to Vercel:
    echo    • Go to https://vercel.com
    echo    • Import from GitHub: ROBO-WORLD-RB/earth-2.0
    echo    • Add environment variables (see GITHUB_DEPLOYMENT.md^)
    echo    • Deploy automatically
    echo.
    echo 🌟 Your EARTH AI Brain Studio is now ready for the world!
    echo.
    echo 📊 What's included:
    echo • 8 major AI features
    echo • 25+ React components
    echo • 10+ service modules
    echo • Complete documentation
    echo • Production optimizations
    echo • PWA support
    echo • Global deployment ready
    echo.
    echo ✨ Happy coding! Your AI workspace is live!
    echo.
    pause
)