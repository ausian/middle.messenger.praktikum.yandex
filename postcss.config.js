import postcssNested from 'postcss-nested';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import reporter from 'postcss-reporter';

export default {
  plugins: [
    postcssNested(),
    postcssPresetEnv(),
    autoprefixer(),
    reporter({ clearReportedMessages: true })
  ],
};
