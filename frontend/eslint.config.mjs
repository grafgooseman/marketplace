import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable strict TypeScript checks
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      
      // Disable React strict checks
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'off',
      
      // Disable Next.js image optimization warnings
      '@next/next/no-img-element': 'off',
      
      // Allow unused imports
      'no-unused-vars': 'off',
      
      // Disable other strict checks
      'prefer-const': 'off',
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
