#!/bin/bash

# EARTH AI Brain Studio - GitHub Deployment Script
# Pushes all files to https://github.com/ROBO-WORLD-RB/earth-2.0

echo "🚀 EARTH AI Brain Studio - GitHub Deployment"
echo "============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the EARTH-APP directory."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed. Please install Git first."
    exit 1
fi

echo "📋 Repository: https://github.com/ROBO-WORLD-RB/earth-2.0"
echo "📁 Current directory: $(pwd)"
echo ""

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add remote origin
echo "🔗 Setting up remote repository..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/ROBO-WORLD-RB/earth-2.0.git
echo "✅ Remote repository configured"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Storybook build outputs
.out
.storybook-out

# Temporary folders
.tmp/
.temp/
EOF
    echo "✅ .gitignore created"
fi

# Stage all files
echo "📦 Staging all files..."
git add .
echo "✅ All files staged"

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit. Repository is up to date."
else
    # Create commit
    echo "💾 Creating commit..."
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

    echo "✅ Commit created successfully"
fi

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main
echo "✅ Main branch configured"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
echo "📡 Repository: https://github.com/ROBO-WORLD-RB/earth-2.0"

if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! EARTH AI Brain Studio deployed to GitHub!"
    echo "=============================================="
    echo ""
    echo "📍 Repository URL: https://github.com/ROBO-WORLD-RB/earth-2.0"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Visit your GitHub repository to verify all files are present"
    echo "2. Deploy to Vercel:"
    echo "   • Go to https://vercel.com"
    echo "   • Import from GitHub: ROBO-WORLD-RB/earth-2.0"
    echo "   • Add environment variables (see GITHUB_DEPLOYMENT.md)"
    echo "   • Deploy automatically"
    echo ""
    echo "🌟 Your EARTH AI Brain Studio is now ready for the world!"
    echo ""
    echo "📊 What's included:"
    echo "• 8 major AI features"
    echo "• 25+ React components"
    echo "• 10+ service modules"
    echo "• Complete documentation"
    echo "• Production optimizations"
    echo "• PWA support"
    echo "• Global deployment ready"
    echo ""
    echo "✨ Happy coding! Your AI workspace is live!"
else
    echo ""
    echo "❌ Push failed. This might be due to:"
    echo "1. Authentication issues - make sure you're logged into GitHub"
    echo "2. Repository permissions - ensure you have write access"
    echo "3. Network connectivity issues"
    echo ""
    echo "🔧 Try these solutions:"
    echo "1. Configure Git credentials:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    echo ""
    echo "2. Use GitHub CLI for authentication:"
    echo "   gh auth login"
    echo ""
    echo "3. Or push manually with authentication:"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi