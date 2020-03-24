import React, {useState, useEffect} from 'react';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import './App.css';
import Chart from './Chart';
import MyAppBar from './MyAppBar';
import theme from './theme';
import axios from 'axios';


function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const stockSymbol = 'msft';
  const url = `https://api.iextrading.com/1.0/tops/last?symbols=${stockSymbol}`
  const options = {
    credentials: "include",
    headers: {
      'Content-Type': 'application/json'
    }
  }

  useEffect(() => {
    const _fetch = async () => {
     const data = await axios.get(url)
     console.log('data', data)
    }
    _fetch();
  }, [])

  return (
    <ThemeProvider theme={theme}>
    <div className="App">
    <MyAppBar 
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
    />
      <Chart
        selectedTab={selectedTab}
      />
    </div>
    </ThemeProvider>
  );
}

export default App;
