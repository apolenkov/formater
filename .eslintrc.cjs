// eslint-disable-next-line fp/no-mutation
module.exports = {
  // Basic parser settings
  parserOptions: {
    ecmaVersion: 2022, // Support for JavaScript 2022 syntax
    sourceType: 'module', // Use ES module system
  },

  // Environment settings
  env: {
    es2021: true, // Enable ES2021 features
    node: true, // Enable Node.js global variables
  },

  // Global variables definition
  globals: {
    window: false, // Global window variable is read-only
  },

  // ESLint plugins
  plugins: [
    'ascii',
    'node',
    'promise',
    'import',
    'simple-import-sort',
    'fp',
    'n',
  ],

  // Extended rule sets
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:import/recommended',
    'prettier', // Disable formatting rules that conflict with Prettier
  ],

  rules: {
    // ======================================================
    // 1. CRITICAL ERRORS AND SECURITY ISSUES
    // ======================================================
    'no-eval': 'error', // Disallow eval()
    'no-with': 'error', // Disallow with statements
    'no-unsafe-optional-chaining': 'error', // Unsafe optional chaining
    'no-buffer-constructor': 'error', // Deprecated Buffer constructor
    'node/no-deprecated-api': 'error', // Deprecated Node.js APIs
    'n/global-require': 'error', // Require at top-level only

    // ======================================================
    // 2. POTENTIAL ERRORS
    // ======================================================
    'eqeqeq': 'error', // Require === instead of ==
    'no-undef': 'error', // Undefined variables
    'no-dupe-keys': 'error', // Duplicate keys in objects
    'no-dupe-args': 'error', // Duplicate arguments in functions
    'no-redeclare': 'error', // Variable redeclaration
    'no-unused-vars': ['error', { ignoreRestSiblings: true }], // Unused vars
    'no-unreachable': 'error', // Unreachable code
    'no-func-assign': 'error', // Function reassignment
    'no-const-assign': 'error', // Const reassignment
    'no-class-assign': 'error', // Class reassignment
    'no-sparse-arrays': 'error', // Sparse arrays
    'no-duplicate-case': 'error', // Duplicate case in switch
    'no-this-before-super': 'error', // This before super()
    'no-empty-character-class': 'error', // Empty character classes
    'valid-typeof': ['error', { requireStringLiterals: true }], // Valid typeof
    'constructor-super': 'error', // Super() in constructors
    'no-empty': 'error', // Empty blocks
    'no-debugger': 'error', // Debugger statements
    'use-isnan': 'error', // Use isNaN() for NaN checks (upgraded to error)
    'no-self-assign': 'error', // Self-assignment (upgraded to error)
    'no-extra-boolean-cast': 'warn', // Unnecessary boolean casts
    'block-scoped-var': 'warn', // Variables used in their block
    'no-param-reassign': 'warn', // Reassigning function parameters
    'no-implicit-coercion': 'warn', // Implicit type conversion
    'import/no-cycle': 'error', // Prevent circular dependencies

    // ======================================================
    // 3. CODE STYLE RULES
    // ======================================================
    // 3.1 Naming and declarations
    'camelcase': [
      'error',
      {
        properties: 'always', // CamelCase for all properties
        ignoreDestructuring: false, // CamelCase in destructuring too
      },
    ],
    'ascii/valid-name': 'error', // ASCII characters in names
    'no-var': 'error', // No var, use let/const
    'prefer-const': 'error', // Prefer const when possible (upgraded)
    'one-var': [
      'error',
      {
        initialized: 'never',
        uninitialized: 'always',
      },
    ], // Variable declaration rules
    'symbol-description': 'error', // Description for Symbol() (upgraded)

    // Functional programming rules (alternative to functional/no-let)
    'fp/no-let': 'warn', // Prefer const over let
    'fp/no-loops': 'warn', // Prefer map, filter, reduce over loops

    // 3.2 Formatting and indentation
    'semi': 'error', // Require semicolons
    'quotes': ['error', 'single'], // Single quotes for strings

    // TODO: Remove after prettier will fix
    // 'max-len': ['error', 80, { ignoreUrls: true }], // Max line length 80

    'indent': ['error', 2, { SwitchCase: 1 }], // 2 space indent (upgraded)
    'eol-last': 'error', // Newline at end of file
    'no-tabs': 'error', // No tabs
    'no-trailing-spaces': 'error', // No trailing spaces
    'no-irregular-whitespace': 'error', // No irregular whitespace
    'no-multi-spaces': 'error', // No multiple spaces
    'no-multiple-empty-lines': ['error', { max: 1 }], // Max 1 empty line
    'no-unexpected-multiline': 'error', // No unexpected multiline
    'quote-props': ['error', 'consistent-as-needed'], // Property quotes
    'comma-spacing': ['error', { before: false, after: true }],
    'no-extra-semi': 'warn',

    // 3.3 Spacing
    'spaced-comment': ['error', 'always', { markers: ['/'] }], // Comment spaces
    'keyword-spacing': 'error', // Spaces around keywords
    'space-before-blocks': ['error', 'always'], // Space before blocks
    'object-curly-spacing': ['error', 'always'], // Spaces in object braces
    'array-bracket-spacing': ['error', 'never'], // No spaces in arrays
    'space-in-parens': ['error', 'never'], // No spaces in parentheses
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never', // No space for anonymous functions
        named: 'never', // No space for named functions
        asyncArrow: 'always', // Space for async arrow functions
      },
    ],
    'padded-blocks': [
      'error',
      {
        blocks: 'never', // No padding in blocks
        classes: 'never', // No padding in classes
        switches: 'never', // No padding in switch
      },
    ],
    'rest-spread-spacing': ['error', 'never'], // No spaces in spread
    'template-curly-spacing': ['error', 'never'], // No spaces in ${var}

    // 3.4 Code structure
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'return' }, // Line before return
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      }, // Spacing between variable declarations
      { blankLine: 'always', prev: 'if', next: '*' }, // Line after if
      { blankLine: 'any', prev: 'if', next: 'if' }, // Spacing between ifs
      { blankLine: 'always', prev: '*', next: 'function' }, // Line before func
      { blankLine: 'always', prev: 'function', next: '*' }, // Line after func
    ],
    'curly': ['error', 'multi-or-nest', 'consistent'], // Curly braces rules
    'brace-style': ['error', '1tbs', { allowSingleLine: true }], // Brace style

    // 3.5 Import organization
    'import/first': 'error', // Imports first
    'import/newline-after-import': 'error', // Newline after imports
    'import/no-duplicates': 'error', // No duplicate imports
    'import/exports-last': 'warn', // Exports at the end of file
    'n/file-extension-in-import': 'error', // Require file extensions
    'n/prefer-node-protocol': 'warn', // Prefer node: protocol
    'simple-import-sort/exports': 'error', // Sort exports
    'simple-import-sort/imports': [
      'error',
      {
        // Custom import groups order
        groups: [
          ['^\\u0000'], // Side effect imports
          ['^node:'], // Node.js builtins with node: protocol
          ['^@?\\w'], // External packages
          ['^'], // Absolute imports
          ['^\\.'], // Relative imports
        ],
      },
    ],

    // ======================================================
    // 4. MODERN JAVASCRIPT FEATURES (ES6+)
    // ======================================================
    'prefer-rest-params': 'error', // Rest params over arguments
    'prefer-template': 'error', // Template literals over concatenation
    'prefer-destructuring': [
      'warn',
      {
        array: true, // Array destructuring
        object: true, // Object destructuring
      },
    ],
    'object-shorthand': ['error', 'properties'], // Object shorthand
    'no-useless-computed-key': 'error', // No useless computed keys
    'no-useless-rename': 'error', // No useless destructuring rename
    'arrow-body-style': ['warn', 'as-needed'], // Concise arrow functions

    // ======================================================
    // 5. NODE.JS RULES
    // ======================================================
    'node/exports-style': ['error', 'module.exports'], // module.exports style
    'node/no-unpublished-require': 'off', // Allow unpublished in require
    'node/no-unpublished-import': 'off', // Allow unpublished in import
    'no-process-exit': 'warn', // Warn on direct process.exit()
    'no-path-concat': 'error', // No string path concatenation

    // ======================================================
    // 6. ASYNCHRONOUS CODE RULES
    // ======================================================
    // 6.1 Promise
    'promise/param-names': 'error', // Standard promise param names
    'promise/always-return': 'warn', // Always return from then()
    'promise/no-return-wrap': 'error', // No wrapping values in Promise
    'promise/catch-or-return': 'warn', // Handle promise errors

    // 6.2 Async/Await
    'no-return-await': 'error', // No redundant return await
    'require-await': 'warn', // Require await in async functions
  },
};
