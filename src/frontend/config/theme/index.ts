import { heroui } from '@heroui/react';

import { darkTheme } from './dark';
import { lightTheme } from './light';

export default heroui({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
});
