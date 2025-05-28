module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended' // This must be last
  ],
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  globals: {
    // Foundry VTT globals
    game: 'readonly',
    ui: 'readonly',
    canvas: 'readonly',
    CONFIG: 'readonly',
    CONST: 'readonly',
    foundry: 'readonly',
    Actor: 'readonly',
    Item: 'readonly',
    ChatMessage: 'readonly',
    Dialog: 'readonly',
    Application: 'readonly',
    FormApplication: 'readonly',
    CanvasLayer: 'readonly',
    PIXI: 'readonly',
    Hooks: 'readonly',
    renderTemplate: 'readonly',
    Roll: 'readonly',
    TextEditor: 'readonly',
    loadTemplates: 'readonly',
    mergeObject: 'readonly',
    duplicate: 'readonly',
    getTemplate: 'readonly',
    // Vitest globals
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly',
    test: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly'
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // Foundry VTT APIs often use any
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Disable some strict rules that don't work well with Foundry VTT
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',

    // General rules
    'no-console': 'off', // Console logs are useful for development
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-empty': ['error', { allowEmptyCatch: true }],
    '@typescript-eslint/no-empty-function': [
      'error',
      {
        allow: ['constructors', 'methods', 'arrowFunctions']
      }
    ],

    // Prettier will handle these
    'prettier/prettier': 'error'
  },
  overrides: [
    {
      // Test files
      files: ['test/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // Tests can be more relaxed
      }
    },
    {
      // Allow require() in config files
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
