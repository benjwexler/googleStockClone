import React, { useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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
    [theme.breakpoints.down('xs')]: {
      padding: '5px 10px',
      borderRadius: '50%',
      // background: '#f5f5f5',
    },
   
  },
  appBarRoot: {
    boxShadow: 'none',
    borderBottom: '1px solid #dcd9d9',
  },
  tabRoot: {
    minWidth: 85,
    fontSize: 13,
    cursor: 'pointer',
    margin: 'auto',
    [theme.breakpoints.down('sm')]: {
      minWidth: 40,
      paddingLeft: 2,
      paddingRight: 2,
    },
  },
  flexContainer: {
    // justifyContent: 'space-around',
  },
  tabIndicatorProps: {
    transition: 'none',
    bottom: 0,
    height: 2,
    position: 'absolute',
    background: 'black',
    [theme.breakpoints.down('sm')]: {
      height: 0,
    },
  },
  tabSelected: {
    [theme.breakpoints.down('xs')]: {
      color: '#3367d6 !important',
    },
  }
}));

export default function MyAppBar({selectedTab, setSelectedTab, setShowTooltip}) {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    setShowTooltip(false)
  };

  const tabProps = {
    classes: {
      wrapper: classes.wrapper,
      root: classes.tabRoot,
      selected: classes.tabSelected,
    },
    disableRipple: true,
    
  }


const [width, setWidth] = useState(600);
  useEffect(() => {
    setWidth(document.body.clientWidth)
    window.addEventListener("resize", () => {
      setWidth(document.body.clientWidth)
    });

  }, [])

  const getTabText = (text, mobileText, _width = width) => {
    if(_width >= 600) {
      return text
    }
    return mobileText;
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
            flexContainer: classes.flexContainer
          }}
          TabIndicatorProps={{
            class: classes.tabIndicatorProps
          }}
          selected
        >
          <Tab {...tabProps} label={getTabText('1 day', '1D')}  />
          <Tab {...tabProps} label={getTabText('5 days', '5D')}  />
          <Tab {...tabProps} label={getTabText('1 month', '1M')} />
          <Tab {...tabProps} label={getTabText('6 months', '6M')} />
          <Tab {...tabProps} label={getTabText('YTD', 'YTD')}  />
          <Tab {...tabProps} label={getTabText('1 year', '1Y')} />
          <Tab {...tabProps} label={getTabText('5 years', '5Y')} />
          {/* <Tab {...tabProps} disabled label="Max" /> */}
        </Tabs>
      </AppBar>
    </div>
  );
}