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

const colorGreen = 'rgb(15, 157, 88)';

function formatNumber(num) {
  if(!num) return num;
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const mappedSymbols = stockSymbols.map(symbol => {
  symbol.value = symbol.symbol;
  symbol.label = `${symbol.symbol} - ${symbol.name}`

  return symbol
})

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
  const [stock, setStock] = useState({symbol: 'FB', name: 'Facebook Inc. Class A'})
  const [fiveYearData, setFiveYearData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState({});

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


  const getPercentageChange = (_latestProce, _previousClose) => {
    return (((_latestProce/_previousClose) - 1) * 100).toFixed(2)
  }
  useEffect(() => {
    const _fetch = async () => {
      setIsLoading(true);
      const duration = getDuration(selectedTab)
      const testToken = 'Tsk_4f28bfa86e2e4385b069966f7dd179a3'
      const token ='pk_34d804bf14b645efbdaf40ff1e393927'
      const testUrl = `https://sandbox.iexapis.com/stable/stock/${stock.symbol}/batch?types=quote,chart&range=${duration}&last=10&token=${testToken}`;
      const url = `https://cloud.iexapis.com/stable/stock/${stock.symbol}/batch?types=quote,chart&range=${duration}&token=${token}`

      const isRealData = false;

      try {
        const res = await axios.get(isRealData ? url : testUrl )
        console.log('res', res.data)
        setQuote(res.data.quote)
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
          onChange={(stock) => stock && stock.symbol ? setStock(stock) : null}
          className="select"
        />
      </div>
      <h3 className="stockName" style={{marginLeft: 10}}>{stock.symbol} - {stock.name}</h3>
      <h2 
        style={{marginLeft: 10}}
      >
        {formatNumber(quote.latestPrice)} 
        <span style={{fontSize: 16, color: 'rgba(0,0,0,.62)'}}> USD</span>
        <span style={{fontSize: 16, color: quote.latestPrice - quote.previousClose >= 0 ? colorGreen : 'red'}}> {(quote.latestPrice - quote.previousClose).toFixed(2)} ({getPercentageChange(quote.latestPrice, quote.previousClose)}%) </span>
        <i style={{fontSize: 14, color: quote.latestPrice - quote.previousClose >= 0 ? colorGreen : 'red'}} className={`fas ${quote.latestPrice - quote.previousClose >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
      </h2>
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
            isInGreenToday={quote.latestPrice - quote.previousClose >= 0}
            previousClose={quote.previousClose}
          />
        </div>
      </div>

    </ThemeProvider>

  );
}

export default App;
