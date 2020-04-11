import React, { useState, useEffect } from 'react';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import './App.css';
import Chart from './Chart';
import MyAppBar from './MyAppBar';
import theme from './theme';
import axios from 'axios';
import moment, { utc } from 'moment';
import Select from 'react-select';
import stockSymbols from './stockSymbols.json';
import { stripDiacritics } from './diacritics.js'
import { createFilter } from './filters';
import Async, { makeAsyncSelect } from 'react-select/async';
import WindowedSelect from "react-windowed-select";

console.log('stripDiacritics', stripDiacritics)

const mappedSymbols = stockSymbols.map(symbol => {
  symbol.value = symbol.symbol;
  symbol.label = `${symbol.symbol} - ${symbol.name}`

  return symbol
})
// .slice(0, 200);


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
  const [stock, setStock] = useState('fb')
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
      const url = `https://sandbox.iexapis.com/stable/stock/${stock}/batch?types=quote,chart&range=${duration}&last=10&token=${token}`;

      try {
        const res = await axios.get(url)
        const data = res.data.chart;
        const formattedData = data.map(getFormattedDataAction(selectedTab, data))
        setFiveYearData(formattedData)
      } catch (err) {
        console.log('err', err)
      }
    }
    _fetch();
  }, [selectedTab, stock])


  useEffect(() => {
    setIsLoading(false)
  }, [fiveYearData])

  const [showTooltip, setShowTooltip] = useState(false);
  const resultLimit = 1000
  let i = 0
  return (

    <ThemeProvider theme={theme}>
      <div>
        <WindowedSelect
          isClearable
          filterOption={({ label, data }, query) => {
            return (
              label.toUpperCase().indexOf(query.toUpperCase()) >= 0 && i++ < resultLimit
            )
          }
          }
          options={mappedSymbols}
          onInputChange={() => { i = 0 }}
          onChange={(stock) => stock && stock.symbol ? setStock(stock.symbol) : null}
          className="select"
        />
      </div>
      <div id="container">
        <div className="App">
          <MyAppBar
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
          />
          <Chart
            selectedTab={selectedTab}
            fiveYearData={fiveYearData}
            isLoading={isLoading}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
          />
        </div>
      </div>

    </ThemeProvider>

  );
}

export default App;
