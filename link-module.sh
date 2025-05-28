#!/bin/bash

# Link script for Realms & Reaches development
# Creates a symlink from Foundry's modules directory to the dist folder

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Module information
MODULE_NAME="realms-and-reaches"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Default Foundry data path (can be overridden by environment variable)
if [[ -z "$FOUNDRY_DATA_PATH" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        FOUNDRY_DATA_PATH="$HOME/Library/Application Support/FoundryVTT"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        FOUNDRY_DATA_PATH="$APPDATA/FoundryVTT"
    else
        # Linux
        FOUNDRY_DATA_PATH="$HOME/.local/share/FoundryVTT"
    fi
fi

MODULES_DIR="$FOUNDRY_DATA_PATH/Data/modules"
MODULE_LINK="$MODULES_DIR/$MODULE_NAME"

echo -e "${YELLOW}Realms & Reaches Module Linker${NC}"
echo "=================================="

# Check if dist directory exists
if [[ ! -d "$DIST_DIR" ]]; then
    echo -e "${RED}Error: dist directory not found at $DIST_DIR${NC}"
    echo "Please run 'npm run build' first to create the dist directory."
    exit 1
fi

# Check if Foundry modules directory exists
if [[ ! -d "$MODULES_DIR" ]]; then
    echo -e "${RED}Error: Foundry modules directory not found at $MODULES_DIR${NC}"
    echo "Please ensure Foundry VTT is installed and has been run at least once."
    echo "You can also set the FOUNDRY_DATA_PATH environment variable to override the default path."
    exit 1
fi

# Remove existing link or directory
if [[ -L "$MODULE_LINK" ]]; then
    echo "Removing existing symlink..."
    rm "$MODULE_LINK"
elif [[ -d "$MODULE_LINK" ]]; then
    echo -e "${YELLOW}Warning: Directory exists at $MODULE_LINK${NC}"
    read -p "Do you want to remove it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$MODULE_LINK"
    else
        echo "Aborted."
        exit 1
    fi
fi

# Create the symlink
echo "Creating symlink from $MODULE_LINK to $DIST_DIR..."
ln -s "$DIST_DIR" "$MODULE_LINK"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Successfully linked module!${NC}"
    echo ""
    echo "Module linked to: $MODULE_LINK"
    echo "Source directory: $DIST_DIR"
    echo ""
    echo "You can now:"
    echo "1. Start Foundry VTT"
    echo "2. Enable the 'Realms & Reaches' module in a world"
    echo "3. Use 'npm run watch' for live development"
    echo ""
    echo -e "${YELLOW}Note: Remember to run 'npm run build' after making changes if not using watch mode.${NC}"
else
    echo -e "${RED}✗ Failed to create symlink${NC}"
    exit 1
fi