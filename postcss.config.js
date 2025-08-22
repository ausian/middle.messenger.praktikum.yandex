import postcssNested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    postcssNested(),
    postcssPresetEnv(),
    autoprefixer(),
  ],
};