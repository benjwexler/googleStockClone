
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipWeekends } from 'd3fc-discontinuous-scale';
import moment, { utc } from 'moment';

const margin = 40;

const getAxisXInfo = (tab) => {
  const tabs = {
    0: {
      ticks: 3,
      tickFormat: d => d.format("hh:mm A"),
    },
    1: {
      ticks: 5,
      tickFormat: d => d.format("MMM DD"),
    },
    2: {
      ticks: 3,
      tickFormat: d => d.format("M-D"),
    },
    3: {
      ticks: 3,
      tickFormat: d => d.format("MMM YYYY"),
    },
    4: {
      ticks: 3,
      tickFormat: d => d.format("M-D"),
    },
    5: {
      ticks: 5,
      tickFormat: d => d.format("YYYY"),
    },
    6: {
      ticks: 5,
      tickFormat: d => d.format("YYYY"),
    },
  }

  return tabs[tab];
}

const updateChart = ({
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
  bisectLine
}) => {
  clippedPath
    .attr("width", width)
    .attr("height", height);

  if (isLoading) {
    return;
  }

  d3.selectAll("circle").remove();
  d3.selectAll(".line").remove();
  d3.selectAll(".area").remove();

  let data = fiveYearData;

  if (selectedTab === 0) {
    data = data.filter(date => {
      if (!date.minute || !date.y) {
        return false
      }
      return parseInt(date.minute.slice(-2)) % 5 === 0
    })
  }

  if (selectedTab === 1) {
    data = data.filter(date => {
      if (!date.minute || !date.y) {
        return false;
      }
      return parseInt(date.minute.slice(-2)) % 30 === 0
    })
  }

  if (selectedTab == 6) {
    const mostRecenDayOfWeek = data[data.length - 1].x.day();
    data = data.filter(date => date.x.day() === mostRecenDayOfWeek);
  }

  const yTicks = Math.round(height / 50);
  const maxY = Math.max.apply(Math, data.map(function (o) { return o.y; }))
  const minY = Math.min.apply(Math, data.map(function (o) { return o.y; }))

  if (!data.length || !data.length > 1) {
    return 
  }

  let domain = [data[0].x, data[data.length - 1].x]

  let xScale = scaleDiscontinuous(d3.scaleUtc())
    .domain(domain)
    .range([0, width])

  if ((data && data.length) && (selectedTab === 7 || selectedTab === 1 || selectedTab === 2 || selectedTab === 3 || selectedTab === 4 || selectedTab === 5 || selectedTab === 6)) {
    const tradingDatesArray = data.map(d => d.x);
    let offDayArr = []
    tradingDatesArray.forEach((data, i) => {
      if (tradingDatesArray[i + 1]) {
        let diff;
        if (selectedTab === 1) {
          diff = tradingDatesArray[i].diff(tradingDatesArray[i + 1], 'minutes');
        } else {
          diff = tradingDatesArray[i].diff(tradingDatesArray[i + 1], 'days');
        }

        if (selectedTab !== 1 & diff !== -1) {
          offDayArr.push([tradingDatesArray[i].clone().add(1, 'days'), tradingDatesArray[i + 1].clone()])
        }

        if (selectedTab === 1 & diff !== -30) {
          offDayArr.push([tradingDatesArray[i].clone().add(30, 'minutes'), tradingDatesArray[i + 1].clone()])
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
    switch (selectedTab) {
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

  if (fiveYearData.length && selectedTab !== 0) {
    const _fiveYearData = fiveYearData.filter(d => d.x)
    const interval = fiveYearData.length / getAxisXInfo(selectedTab).ticks

    for (let i = interval; i < _fiveYearData.length; i += interval) {
      threeTicks.push(returnStartOfMonth(_fiveYearData[Math.round(i)].x))
    }

    threeTicks.push(returnStartOfMonth(_fiveYearData[_fiveYearData.length - 1].x))
  }

  if (fiveYearData.length && (selectedTab === 0)) {
    const createOneDaytickValues = () => {
      let todaysDate = moment(fiveYearData[0].x.clone()).format('YYYY-MM-DD');
      return (
        [
          moment(todaysDate).add(12, 'hours'),
          moment(todaysDate).add(15, 'hours'),
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
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));

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
    .attr("height", height + 100)
    .style("fill", "none")
    .style("pointer-events", "all")
    .raise()
    .on('mousemove', function () {
      const date = new Date(xScale.invert(d3.mouse(this)[0]))
      const invertAmount = xScale(date)
      let translateX = Math.round(invertAmount);

      bisectLine
        .attr("transform", `translate(${translateX}, 0)`)
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


  const onMount = () => {
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
      .attr('class', 'bisectLine')
      .attr("style", "stroke:#999; stroke-width:0.5; stroke-dasharray: 5 3;")
      .attr("x1", 0)
      .attr("x2", 0)
      .style("opacity", "0");

    mouseContainer.current = svg.current.append("rect")
      .on('mouseout', function () {
        bisectLine.current
          .style("opacity", "0")
      })
      .on('mouseover', function () {
        bisectLine.current
          .style("opacity", "1")
      })
  }

  useEffect(() => {
    onMount()
  }, [])

  useEffect(() => {
    updateChart({
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
      bisectLine: bisectLine.current,
    })
  }, [yDomain, height, width, selectedTab, fiveYearData, isLoading])

  return (
    null
  );
}

export default Chart;
