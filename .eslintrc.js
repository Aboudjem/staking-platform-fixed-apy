module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
  },
  "overrides": [
  {
    "files": "*.sol",
    "options": {
      "printWidth": 80,
      "tabWidth": 4,
      "useTabs": false,
      "singleQuote": false,
      "bracketSpacing": false,
      "explicitTypes": "always"
    }
  }
  ]
};
