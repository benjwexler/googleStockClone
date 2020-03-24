import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
   
  },
  scrollButtons: {
    color: 'black',
  },
  wrapper: {
    textTransform: 'none',
  },
  appBarRoot: {
    boxShadow: 'none',
    borderBottom: '1px solid #dcd9d9',
  },
  tabRoot: {
    minWidth: 85,
    fontSize: 13,
    cursor: 'pointer',
  },
  tabIndicatorProps: {
    transition: 'none',
    bottom: 0,
    height: 2,
    position: 'absolute',
    background: 'black',
  }
}));

export default function MyAppBar({selectedTab, setSelectedTab}) {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const tabProps = {
    classes: {
      wrapper: classes.wrapper,
      root: classes.tabRoot
    },
    disableRipple: true,
    
  }
  return (
    <div className={classes.root}>
      <AppBar 
        position="static"
        classes={{
          root: classes.appBarRoot,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          aria-label="simple tabs example"
          style={{background: 'white'}}
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          classes={{
            scrollButtons: classes.scrollButtons,
          }}
          TabIndicatorProps={{
            class: classes.tabIndicatorProps
          }}
        >
          <Tab {...tabProps} label="1 day"  />
          <Tab {...tabProps} label="5 days"  />
          <Tab {...tabProps} label="1 month" />
          <Tab {...tabProps} label="6 months" />
          <Tab {...tabProps} label="YTD"  />
          <Tab {...tabProps} label="1 year" />
          <Tab {...tabProps} label="5 years" />
          <Tab {...tabProps} disabled label="Max" />
        </Tabs>
      </AppBar>
    </div>
  );
}