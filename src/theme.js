
import { createMuiTheme } from '@material-ui/core/styles';
import {white, purple, green, grey } from '@material-ui/core/colors'

const theme = createMuiTheme({
  palette: {
    primary: {main: grey[900]},
    secondary: green,
  },
  status: {
    danger: 'orange',
  },
});

export default theme;