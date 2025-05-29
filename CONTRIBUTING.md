# Contributing to Realms & Reaches

Thank you for your interest in contributing to Realms & Reaches! This guide will help you understand how to contribute effectively to the project.

## Table of Contents

- [Current Status](#current-status)
- [How You Can Help](#how-you-can-help)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Branching Strategy](#branching-strategy)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

## Current Status

Realms & Reaches is in **ALPHA** stage. This means:

- ✅ **Accepting**: Bug reports
- ✅ **Accepting**: Testing feedback
- ✅ **Accepting**: Documentation improvements
- ⚠️ **Limited**: Feature suggestions (check roadmap first)
- ⚠️ **Case-by-case**: Code contributions (please discuss first)

## How You Can Help

### 1. Report Bugs

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description and reproduction steps
- Environment details (Foundry version, game system, etc.)
- Console errors (F12 in browser)
- Screenshots if applicable

### 2. Test the Module

- Test with different game systems
- Try various workflows and edge cases
- Run the Quench test suites
- Report your findings

### 3. Improve Documentation

- Fix typos and clarify existing docs
- Add examples and use cases
- Translate to other languages
- Create video tutorials

### 4. Share Ideas

Before suggesting features:

- Check the [README](README.md) for planned features
- Search existing issues
- Focus on user experience improvements
- Consider compatibility with multiple game systems

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Foundry VTT v13+ installation
- Git

### Setup Steps

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/fvtt-realms-and-reaches.git
   cd fvtt-realms-and-reaches
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Link to your Foundry modules directory:

   ```bash
   ./link-module.sh /path/to/FoundryVTT/Data/modules
   ```

4. Build the module:

   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test          # Watch mode
   npm run test:run  # Single run
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Avoid `any` type - use proper typing

### File Organization

```
src/
├── api.ts              # Public API exports
├── applications/       # UI components
├── documents/         # Document classes
├── helpers.ts         # Utility functions
├── hooks.ts          # Foundry hooks
├── module.ts         # Module entry point
└── system-adapter.ts # System-specific code
```

### Naming Conventions

- **Files**: kebab-case (e.g., `realm-properties-dialog.ts`)
- **Classes**: PascalCase (e.g., `RealmPropertiesDialog`)
- **Functions/Variables**: camelCase (e.g., `getRealmByTags`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MODULE_ID`)

### Code Example

```typescript
/**
 * Find realms that match the specified tags
 * @param tags - Array of tags to search for
 * @returns Array of realm documents matching the tags
 */
export function findRealmsByTags(tags: string[]): RealmDocument[] {
  const realms = game.scenes?.current?.realms ?? [];
  return realms.filter(realm => {
    return tags.every(tag => realm.tags.includes(tag));
  });
}
```

## Branching Strategy

### Branch Types

- `main` - Stable releases
- `develop` - Integration branch (if used)
- `feature/` - New features (e.g., `feature/realm-export`)
- `fix/` - Bug fixes (e.g., `fix/tag-filtering`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Linear Integration

We use Linear for issue tracking. Branch names should include the issue ID:

- `feature/FOU-123-realm-export`
- `fix/FOU-456-tag-filtering`)

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(realm-layer): add realm export functionality

Add ability to export realm data for backup and sharing.
Includes all tags, boundaries, and metadata.

Fixes FOU-123
```

```
fix(realm-manager): correct tag filtering for complex queries

Tag intersection queries were not working properly when
multiple tags contained similar substrings.
```

## Pull Request Process

### Before Submitting

1. **Discuss First**: For features, open an issue first
2. **Update From Main**: Ensure your branch is current
3. **Run Tests**: All tests must pass
4. **Check Linting**: No errors or warnings
5. **Update Docs**: Include relevant documentation updates
6. **Update CHANGELOG**: Add your changes

### PR Checklist

- [ ] Tests pass (`npm run test:run`)
- [ ] Code follows style guidelines
- [ ] Commits follow conventions
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No console errors in Foundry

### Review Process

1. Automated checks must pass
2. Code review by maintainer
3. Testing in multiple game systems
4. Final approval and merge

## Testing Requirements

### Unit Tests (Vitest)

Located in `test/` directory:

```typescript
describe('RealmManager', () => {
  it('should add a realm with tags', () => {
    const manager = new RealmManager();
    manager.addRealm('realm-123', ['forest', 'temperate']);
    expect(manager.hasRealm('realm-123')).toBe(true);
  });
});
```

### Integration Tests (Quench)

For Foundry-specific testing:

```typescript
quench.registerBatch('realms-and-reaches.realm', context => {
  const { describe, it, assert } = context;

  describe('Realm Operations', function () {
    it('should create realm document', async function () {
      const realm = await RealmDocument.create({
        name: 'Test Realm',
        tags: ['forest', 'temperate']
      });
      assert.ok(realm.id);
    });
  });
});
```

### Test Coverage

Aim for:

- 80%+ code coverage for utilities
- Comprehensive Quench tests for Foundry integration
- Manual testing across supported game systems

## Documentation

### Code Comments

````typescript
/**
 * Brief description of what the function does
 *
 * @param param1 - Description of parameter
 * @returns Description of return value
 * @throws {ErrorType} Description of when this error occurs
 *
 * @example
 * ```typescript
 * const result = myFunction('test');
 * ```
 */
````

### User Documentation

- Update user guide for new features
- Include screenshots when helpful
- Add examples of common workflows
- Keep language clear and concise

### API Documentation

- Document all public methods
- Include parameter types and descriptions
- Provide usage examples
- Note system-specific behavior

## Community Guidelines

### Be Respectful

- Treat everyone with respect
- Be patient with new contributors
- Provide constructive feedback
- Celebrate diverse perspectives

### Communication

- Use clear, concise language
- Ask questions when unsure
- Provide context in discussions
- Be responsive to feedback

### Collaboration

- Share knowledge freely
- Help others learn
- Credit contributors
- Build on each other's ideas

## Getting Help

- **Discord**: Find us on Foundry VTT Discord
- **Issues**: Open a GitHub issue
- **Documentation**: Check [docs.rayners.dev](https://docs.rayners.dev/realms-and-reaches)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing to Realms & Reaches! Your efforts help make this module better for the entire community.
