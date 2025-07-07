#!/bin/bash

# StoreSystem-AI Deployment Script
# This script helps you deploy your project to GitHub

echo "🚀 StoreSystem-AI Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
fi

# Check if remote origin exists
if ! git remote get-url origin &> /dev/null; then
    print_warning "No remote origin found. Please add your GitHub repository URL:"
    echo "Example: git remote add origin https://github.com/Ved210105/StoreSystem-AI.git"
    echo "Run this command manually and then run this script again."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

print_status "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_status "Found uncommitted changes. Adding all files..."
    git add .
    
    echo ""
    echo "Please enter a commit message (or press Enter for default):"
    read -r commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update StoreSystem-AI project"
    fi
    
    git commit -m "$commit_message"
    print_status "Changes committed successfully!"
else
    print_status "No uncommitted changes found."
fi

# Try to pull latest changes
print_status "Pulling latest changes from remote..."
if git pull origin $CURRENT_BRANCH --allow-unrelated-histories; then
    print_status "Successfully pulled latest changes."
else
    print_warning "Could not pull latest changes. This might be the first push."
fi

# Push to remote
print_status "Pushing to GitHub..."
if git push -u origin $CURRENT_BRANCH; then
    print_status "✅ Successfully deployed to GitHub!"
    echo ""
    echo "🎉 Your project is now live on GitHub!"
    echo "📁 Repository URL: $(git remote get-url origin)"
    echo ""
    echo "Next steps:"
    echo "1. Visit your GitHub repository"
    echo "2. Set up GitHub Pages (optional)"
    echo "3. Configure deployment settings"
    echo "4. Share your project with others!"
else
    print_error "Failed to push to GitHub. Please check your credentials and try again."
    exit 1
fi

echo ""
print_status "Deployment script completed!" 