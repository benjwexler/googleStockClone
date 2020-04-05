
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipWeekends } from 'd3fc-discontinuous-scale';
import moment, { utc } from 'moment';
import cloneDeep from 'lodash.clonedeep';

const utcOffset = -5;
const margin = 40;

const getDayOfWeek = (date) => {
  return moment(date).day();
}

const getDaysToSubtract = () => {
  const dayOfWeekToday = getDayOfWeek();
  
  switch (dayOfWeekToday) {
    case 0:
      return 2
    case 6:
      return 1
    default:
      return 0;
  }
}

const getLastFiveDaysDomain = () => {
  const daysToSubtract = getDaysToSubtract();
  return [moment().add(utcOffset, 'hours').subtract(4 + daysToSubtract, 'days'), moment().add(utcOffset -1, 'hours').subtract(daysToSubtract, 'days')];
}

const getDaysToAdd = (date) => {
  const dayOfWeekMonthAgo = date.day();
  switch (dayOfWeekMonthAgo) {
    case 0:
      return 1
    case 6:
      return 2
    default:
      return 0;
  }
}

const getMonthsDomain = (months, data) => {
  const monthAgo = moment().subtract(months, 'months');
  return [monthAgo.add(getDaysToAdd(monthAgo), 'days').subtract(1, 'days').toDate(), moment().toDate()]
}

const yearToDateDomain = () => {
  const startOfYearDate = moment().startOf('year')
  return [startOfYearDate.add(getDaysToAdd(startOfYearDate), 'days').toDate(), moment().toDate()]
}

const getYearsDomain = (years) => {
  const yearsAgo = moment().subtract(years, 'years');
  return [yearsAgo.add(getDaysToAdd(yearsAgo), 'days'), moment()]
}

const getAxisXInfo = (tab) => {
  const utcOffset = -5;
  const date = new Date();
  const tabs = {
    0: {
      domain: [new Date(2000, 0, 1, 8 + utcOffset), new Date(2000, 0, 1, 20 + utcOffset)],
      ticks: 3,
      tickFormat: d => {
        return  d.format("hh:mm A");
      },
    },
    1: {
      domain: getLastFiveDaysDomain(),
      ticks: 5,
      tickFormat: d => {
        return d.format("MMM DD");
      },
    },
    2: {
      domain: getMonthsDomain(1),
      ticks:3,
      tickFormat: d => {
        return d.format("M-D");
      },
    },
    3: {
      domain: getMonthsDomain(6),
      ticks: 3,
      tickFormat: d => {
        return d.format("MMM YYYY");
      },
    },
    4: {
      domain: yearToDateDomain(),
      ticks: 3,
      tickFormat: d => {
        return d.format("M-D");
      },
    },
    5: {
      domain: getYearsDomain(1),
      ticks: 5,
      tickFormat: d => {
        return d.format("YYYY");
      },
    },
    6: {
      domain: getYearsDomain(5),
      ticks: 5,
      tickFormat: d => {
        return d.format("YYYY");
      },
    },

  }

  return tabs[tab];
}

const addChart = ({
  svg,
  yAxis,
  xAxis,
  height,
  width,
  selectedTab,
  linearGradient,
  clippedPath,
  yAxisGrid,
  fiveYearData,
  isLoading,
  mouseContainer,
  mousePositionX,
  bisectLine
}) => {
  clippedPath
    .attr("width", width)
    .attr("height", height);

    if(isLoading) {
      return;
    }

  d3.selectAll("circle").remove();
  d3.selectAll(".line").remove();
  d3.selectAll(".area").remove();

  let data = fiveYearData;

  if(selectedTab === 0) {
    data = data.filter(date => {
      if(!date.minute || !date.y) {
        return false
      }
      return parseInt(date.minute.slice(-2)) % 5 === 0
    })
  }

  if(selectedTab === 1) {
    data = data.filter(date => {
      if(!date.minute || !date.y) {
        return false;
      }
      return parseInt(date.minute.slice(-2)) % 30 === 0
    })
  }

   if(selectedTab == 6) {
    const mostRecenDayOfWeek = data[data.length-1].x.day();
    data = data.filter(date => date.x.day() === mostRecenDayOfWeek);
  }
  
  const yTicks = Math.round(height / 50);

  const maxY = Math.max.apply(Math, data.map(function (o) { return o.y; }))
  const minY = Math.min.apply(Math, data.map(function (o) { return o.y; }))
 
  let domain = [0, 0]

  if(fiveYearData.length && fiveYearData.length > 1) {
    domain = [fiveYearData[0].x, fiveYearData[fiveYearData.length-1].x]
  }

  let xScale = scaleDiscontinuous(d3.scaleUtc())
    .domain(domain)
    .range([0, width])

    if( (data &&  data.length) && (selectedTab === 0 || selectedTab === 1 || selectedTab === 2 || selectedTab === 3 || selectedTab === 4 || selectedTab === 5 || selectedTab === 6)) {
      const tradingDatesArray = data.map(d => d.x);
      let offDayArr = []
      tradingDatesArray.forEach((data, i) => {
        if(tradingDatesArray[i+1]) {
          let diff;
          if(selectedTab === 1) {
            diff  = tradingDatesArray[i].diff(tradingDatesArray[i+1], 'minutes');
          } else {
            diff  = tradingDatesArray[i].diff(tradingDatesArray[i+1], 'days');
          }
          
          if(selectedTab !== 1 & diff !== -1) {

            offDayArr.push([tradingDatesArray[i].clone().add(1, 'days'), tradingDatesArray[i+1].clone()])
          }

          if(selectedTab === 1 & diff !== -30) {

            offDayArr.push([tradingDatesArray[i].clone().add(30, 'minutes'), tradingDatesArray[i+1].clone()])
          }
          
        }
      })

  xScale = scaleDiscontinuous(d3.scaleUtc())

  .discontinuityProvider(discontinuityRange(...offDayArr))
      .domain(domain)
    .range([0, width])

    }

  const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([minY, maxY])
    .nice();

  // var yGridTBottomTick = d3.select(".yAxisGrid .tick")
  //   .style("display", "none")

  const yTicksFunc = () => {
    const ticks = d3.axisLeft(yScale)
      .ticks(yTicks)
      return ticks
  }

  yAxis
  .attr('class', 'yAxis')
    .call(yTicksFunc()
      .tickSize(0)
    )

    yAxisGrid
    .call(yTicksFunc()
      .tickSize(-width)
    ).lower()

  let threeTicks = []

  const returnStartOfMonth = (data) => {
    switch(selectedTab) {
      case 3:
      case 4:
        return data.clone().startOf('month');
      case 5:
      case 6:
        return data.clone().startOf('year');
    default:
      return data;
    }
  }

  if (fiveYearData.length && (selectedTab===1 || selectedTab===2 || selectedTab===3 || selectedTab===4 || selectedTab===5 || selectedTab===6)) {
    const _fiveYearData = fiveYearData.filter(d => d.x)
    const interval = fiveYearData.length/getAxisXInfo(selectedTab).ticks

    for(let i=interval; i<_fiveYearData.length; i+=interval) {
      threeTicks.push(returnStartOfMonth(_fiveYearData[Math.round(i)].x))
    }

    threeTicks.push(returnStartOfMonth(_fiveYearData[_fiveYearData.length-1].x))
  }

  if(fiveYearData.length && (selectedTab===0 )) {
    const createOneDaytickValues = () => {
      let todaysDate = moment(fiveYearData[0].x.clone()).format('YYYY-MM-DD')
      // console.log('todaysDate', todaysDate)
      // let todaysDate = '2020-04-03'
      return (
        [
          moment(todaysDate).clone().add(12, 'hours'),
          moment(todaysDate).clone().add(16, 'hours'),
        ]
      )
    }

    threeTicks = createOneDaytickValues();
  }

    xAxis
    .attr('transform', `translate(0, ${height})`)
    .attr('class', 'xAxis')
    .call(d3.axisBottom(xScale)
      .tickValues(threeTicks)
      .tickSizeOuter(0)
      .tickSizeInner(8)
      .tickFormat(getAxisXInfo(selectedTab).tickFormat)
    );

    var line = d3.line()
    .x(function (d, i) {
      return xScale(d.x);
    })
    .y(function (d) {
      return yScale(d.y); }) // set the y values for the line generator 

  svg
  .append("path")
    .datum(data) // 10. Binds data to the line 
    .attr("class", "line") // Assign a class for styling 
    .attr("d", line) // 11. Calls the line generator
    .attr('fill', 'none')
    .attr('stroke', 'rgb(230, 74, 25)')
    .attr('stroke-width', '1.5px')
    .raise()

  // const circle = svg.selectAll()
  //   .data(data)

  // circle
  //   .enter()
  //   .append("circle")
  //   .attr("class", "dots")
  //   .attr("r", 1.5)
  //   .attr('fill', 'red')
  //   .attr("cx", function (d) { return xScale(d.x); })
  //   .attr("cy", function (d) { return yScale(d.y); });

  linearGradient
    .attr("x1", 0).attr("y1", yScale(maxY))
    .attr("x2", 0).attr("y2", yScale(minY))

  var areaData = d3.area()
    .x(function (d) { return xScale(d.x); })
    .y0(height)
    .y1(function (d) { return yScale(d.y); });

  svg.append("path")
    .data([data])
    .attr("class", "area")
    .attr("d", areaData)
    .lower();

    bisectLine
        .attr("y2", height)

    mouseContainer
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .raise()
        .on('mousemove', function() {
          bisectLine
        .attr("transform", `translate(${xScale(xScale.invert(d3.mouse(this)[0]))}, 0)`)
        // .raise()
          
        })
}

const Chart = ({ yDomain, selectedTab, fiveYearData, isLoading }) => {
  const svg = useRef();
  const chart = useRef();
  const yAxis = useRef();
  const xAxis = useRef();
  const linearGradient = useRef();
  const area = useRef();
  const clippedPath = useRef();
  const yAxisGrid = useRef();
  const mouseContainer = useRef();
  const mousePositionX = useRef();
  const bisectLine = useRef();

  const [height, setHeight] = useState(600);
  const [width, setWidth] = useState(600);

  const setDimensions = () => {
    const height = document.body.clientHeight - 200 > 300 ? 300 : document.body.clientHeight - 200;
    const width = document.body.clientWidth - 80 > 600 ? 600 : document.body.clientWidth - 80;
    setHeight(height)
    setWidth(width)
  }

  useEffect(() => {
    setDimensions()
    window.addEventListener("resize", () => {
      setDimensions()
    });

  }, [])


  const addSvg = () => {
    svg.current = d3.select("#root").append("svg")
      .attr('transform', `translate(${margin}, ${margin})`)
      .attr('overflow', 'visible');

    linearGradient.current = svg.current.append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("gradientUnits", "userSpaceOnUse")

    const gradientData = [{ offset: "0%", color: "rgb(255,182,193, .1)" },
    { offset: "50%", color: "white" }]

    linearGradient.current
      .append("stop")
      .attr("offset", gradientData[0].offset)
      .attr("stop-color", gradientData[0].color);

    linearGradient.current
      .append("stop")
      .attr("offset", gradientData[1].offset)
      .attr("stop-color", gradientData[1].color);

    area.current = svg.current.append("path");

    clippedPath.current = svg.current.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")

    chart.current = svg.current
      .append('g')
      .attr('transform', `translate(${0}, ${0})`)

    yAxis.current = chart.current.append('g')
    xAxis.current = chart.current.append('g');
    yAxisGrid.current = chart.current.append('g').attr("class", "yAxisGrid");

    bisectLine.current = svg.current
    .append("line")
    .attr("style", "stroke:#999; stroke-width:0.5; stroke-dasharray: 5 3;")
    .attr("x1", 0)
    .attr("x2", 0);

    mouseContainer.current = svg.current.append("rect")
    .on('mouseout', function() {
      bisectLine.current
      .style("opacity", "0")
    })
    .on('mouseover', function() {
      bisectLine.current
      .style("opacity", "1")
    })

  }

  useEffect(() => {
    addSvg()
  }, [])

  useEffect(() => {
    addChart({
      yDomain,
      svg: svg.current,
      chart: chart.current,
      yAxis: yAxis.current,
      xAxis: xAxis.current,
      height,
      width,
      selectedTab,
      linearGradient: linearGradient.current,
      area: area.current,
      clippedPath: clippedPath.current,
      yAxisGrid: yAxisGrid.current,
      fiveYearData,
      isLoading,
      mouseContainer: mouseContainer.current,
      mousePositionX,
      bisectLine: bisectLine.current,
    })
  }, [yDomain, height, width, selectedTab, fiveYearData, isLoading])

  return (
    null
  );
}

export default Chart;
