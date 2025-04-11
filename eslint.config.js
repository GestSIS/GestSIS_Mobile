// eslint.config.mjs
import pluginVue from "eslint-plugin-vue";
import {
  defineConfigWithVueTs,
  // globalIgnores,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import { globalIgnores } from "eslint/config";

export default defineConfigWithVueTs(
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  globalIgnores(["android*", "Android*"]),
  {
    rules: {
      // 'no-console': import.meta.env.NODE_ENV === 'production' ? 'warn' : 'off',
      // 'no-debugger': import.meta.env.NODE_ENV === 'production' ? 'warn' : 'off',
      "vue/no-deprecated-slot-attribute": "off",
      // '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
