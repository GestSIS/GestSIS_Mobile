import pluginVue from 'eslint-plugin-vue'
export default [
  ...pluginVue.configs['flat/recommended'],
  {
  rules: {
    // 'no-console': import.meta.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'no-debugger': import.meta.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 'vue/no-deprecated-slot-attribute': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
  },
}];
