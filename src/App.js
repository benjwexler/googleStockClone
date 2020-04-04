import React, { useState, useEffect } from 'react';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import './App.css';
import Chart from './Chart';
import MyAppBar from './MyAppBar';
import theme from './theme';
import axios from 'axios';
import moment, { utc } from 'moment';


const getDuration = (selectedTab) => {
  const durationInfo = {
    0: '1d',
    1: '5dm',
    2: '1m',
    3: '6m',
    4: 'ytd',
    5: '1y',
    6: '5y',
  }

  return durationInfo[selectedTab] || '5y';
}


function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [fiveYearData, setFiveYearData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const getFormattedDataAction = (_selectedTab, data) => {
    switch (_selectedTab) {
      case 0:
      case 1:
        return (day) => {
          return {
            x: moment(day.date).add(day.minute.slice(0, 2), 'hours').add(day.minute.slice(-2), 'minutes'),
            y: day.close,
            minute: day.minute,
          };
        }
      default: 
      return (day) => {
        return {
          x: moment(day.date),
          y: day.close,
        }

      }
    }
  }

    useEffect(() => {
      const _fetch = async () => {
        setIsLoading(true);
        const duration = getDuration(selectedTab)
        const token = 'Tsk_4f28bfa86e2e4385b069966f7dd179a3'
        const url = `https://sandbox.iexapis.com/stable/stock/fb/batch?types=quote,chart&range=${duration}&last=10&token=${token}`;
        
        
        try {
        const res = await axios.get(url)

        const data = res.data.chart;


        // const url2 = `https://sandbox.iexapis.com/stable/stock/twtr/chart/${duration}&token=${token}`;
        // const res2 = await axios.get(url2)
        // console.log('res2', res2) 

        const formattedData = data.map(getFormattedDataAction(selectedTab, data))

        setFiveYearData(formattedData)
        } catch(err) {
          
        }
      }
      _fetch();
    }, [selectedTab])


    useEffect(() => {
      setIsLoading(false)
    }, [fiveYearData])

    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <MyAppBar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <Chart
            selectedTab={selectedTab}
            fiveYearData={fiveYearData}
            isLoading={isLoading}
          />
        </div>
      </ThemeProvider>
    );
  }

  export default App;
