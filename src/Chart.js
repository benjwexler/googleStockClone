
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipWeekends } from 'd3fc-discontinuous-scale';
import moment, { utc } from 'moment';

const margin = 40;
const colorGreen = 'rgb(15, 157, 88)';
const gradientData = [{ offset: "0%", colorGreen: "rgb(15, 157, 88, .65)", colorRed: "rgb(255,182,193, .65)" },
{ offset: "50%", color: "rgb(255, 255, 255, 0)" }]

const getTabCompensation = (_selectedTab) => _selectedTab === 0 ? 40 : 0;

const getTooltipTransformX = (_translateX, _tooltipWidth, _width, _selectedTab) => {
  const tabCompensation = getTabCompensation(_selectedTab);
  if ((_translateX - (_tooltipWidth / 2)) < 0) {
    return 0;
  }

  if ((_translateX + tabCompensation) > _width - (_tooltipWidth / 2)) {
    return _width - _tooltipWidth - tabCompensation;
  }

  return _translateX - (_tooltipWidth / 2) ;
}

const getAxisXInfo = (tab) => {
  const tabs = {
    0: {
      ticks: 3,
      tickFormat: d => d.format("h:mm A"),
      tooltipFormat: d => d.format("h:mm A"),
    },
    1: {
      ticks: 5,
      tickFormat: d => d.format("MMM DD"),
      tooltipFormat: d => d.format("ddd, MMM, D h:mm A"),
    },
    2: {
      ticks: 6,
      tickFormat: d => d.format("MMM DD"),
      tooltipFormat: d => d.format("ddd, MMM, D"),
    },
    3: {
      ticks: 3,
      tickFormat: d => d.format("MMM YYYY"),
      tooltipFormat: d => d.format("ddd, MMM, D"),
    },
    4: {
      ticks: 3,
      tickFormat: d => d.format("MMM YYYY"),
      tooltipFormat: d => d.format("ddd, MMM, D, YYYY"),
    },
    5: {
      ticks: 5,
      tickFormat: d => d.format("YYYY"),
      tooltipFormat: d => d.format("ddd, MMM, D, YYYY"),
    },
    6: {
      ticks: 5,
      tickFormat: d => d.format("YYYY"),
      tooltipFormat: d => d.format("ddd, MMM, D, YYYY"),
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
  bisectLine,
  tooltip,
  focusPoint,
  linearGradientStop0,
  linearGradientStop1,
  divContainer,
  isInGreenToday,
  previousCloseLine,
  previousClose,
  previousCloseText,
}) => {
  clippedPath
    .attr("width", width)
    .attr("height", height);

  mouseContainer
    .style("width", `${width}px`)
    .style("height", `${height + 100}px`);


  divContainer
    .style('min-height', `${height + 60}px`)

  if (isLoading) {
    return;
  }

  d3.selectAll(".line").remove();
  d3.selectAll(".area").remove();

  let data = fiveYearData;
  if (!data.length || !data.length > 1) {
    return
  }


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
  let isInGreen = selectedTab !== 0 ? data[0].y <= data[data.length - 1].y : isInGreenToday;

  let xScale = scaleDiscontinuous(d3.scaleUtc())
    .domain(domain)
    .range([0, selectedTab !== 0 ? width : width - getTabCompensation(selectedTab)])

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
    .domain([previousClose && minY < previousClose ? minY : previousClose, previousClose && maxY > previousClose ? maxY : previousClose])
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
      .tickSize(selectedTab !== 0 ? -width : -width + 50)
    ).lower()

  let ticksArr = []

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
      ticksArr.push(returnStartOfMonth(_fiveYearData[Math.floor(i)].x))
    }

    ticksArr.push(returnStartOfMonth(_fiveYearData[_fiveYearData.length - 1].x))
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

    ticksArr = createOneDaytickValues();
  }

  xAxis
    .attr('transform', `translate(0, ${height})`)
    .attr('class', 'xAxis')
    .call(d3.axisBottom(xScale)
      .tickValues(ticksArr)
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
    .attr('stroke', isInGreen ? colorGreen : 'rgb(230, 74, 25)')
    .attr('stroke-width', '1.5px')
    .raise()

  linearGradient
    .attr("x1", 0).attr("y1", yScale(maxY))
    .attr("x2", 0).attr("y2", yScale(minY))
  // .raise();

  var areaData = d3.area()
    .x(function (d) { return xScale(d.x); })
    .y0(height)
    .y1(function (d) { return yScale(d.y); });


  bisectLine
    .attr("y2", height)
    .raise()

  previousCloseLine
    .attr("x2", width)
    .attr("y1", yScale(previousClose))
    .attr("y2", yScale(previousClose))
    .style("display", selectedTab === 0 ? '' : 'none')

  previousCloseText
    .text(`Previous Close ${previousClose}`)
    .style('transform', `translate(${width - 40 + 10}px, ${yScale(previousClose)}px)`)
    .style("display", selectedTab === 0 ? '' : 'none')

  mouseContainer
    .attr("width", width)
    .attr("height", height + 100)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on('mousemove', function () {
      try {
        const mouseX = xScale.invert(d3.mouse(this)[0])

        const bisect = d3.bisector(d => d.x).left
        const i = bisect(data, mouseX, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = mouseX - d0.x > d1.x - mouseX ? d1 : d0;

        const point = d

        const price = point.y;

        bisectLine
          .attr("transform", `translate(${xScale(d.x)}, 0)`)

        const getTooltipTransformY = (yPoint) => {
          if (yPoint < 20) {
            return height - 45
          }
          return - 15;
        }

        tooltip
          .text(`${price} USD ${getAxisXInfo(selectedTab).tooltipFormat(d.x)}`)
          .raise()

        const tooltipWidth = document.querySelector('.tooltip').getBoundingClientRect().width;

        tooltip
          .style('position', 'absolute')
          .style("transform", `translate(${getTooltipTransformX(xScale(d.x), tooltipWidth, width, selectedTab)}px, ${getTooltipTransformY(yScale(d.y))}px)`)

        focusPoint
          .style("fill", isInGreen ? colorGreen : "red")
          .style("stroke", isInGreen ? colorGreen : "red")
          .attr("transform",
            `translate(${xScale(d.x)},
          ${yScale(d.y)})`)
          .raise();
      } catch (err) {
        console.log('err', err)
      }
    })

    .on('touchmove', function () {
      try {
        const touch = d3.event.touches[0];
        console.log('touches', d3.event.touches)
        const mouseX = xScale.invert(touch.clientX - (touch.radiusX * 4))

        const bisect = d3.bisector(d => d.x).left
        const i = bisect(data, mouseX, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = mouseX - d0.x > d1.x - mouseX ? d1 : d0;

        const point = d

        const price = point.y;

        bisectLine
          .attr("transform", `translate(${xScale(d.x)}, 0)`)

        const getTooltipTransformY = (yPoint) => {
          if (yPoint < 20) {
            return height - 45
          }
          return - 15;
        }

        tooltip
          .text(`${price} USD ${getAxisXInfo(selectedTab).tooltipFormat(d.x)}`)
          .raise()

        const tooltipWidth = document.querySelector('.tooltip').getBoundingClientRect().width;

        tooltip
          .style("transform", `translate(${getTooltipTransformX(xScale(d.x), tooltipWidth, width, selectedTab)}px, ${getTooltipTransformY(yScale(d.y))}px)`)

        focusPoint
          .style("fill", isInGreen ? colorGreen : "red")
          .style("stroke", isInGreen ? colorGreen : "red")
          .attr("transform",
            `translate(${xScale(d.x)},
          ${yScale(d.y)})`)
          .raise();
      } catch (err) {
        console.log('err', err)
      }
    })
  // .on('touchmove', function (e) {

  //   var touch = d3.event.touches[0];
  //   console.log('touch', touch)

  // })

  linearGradientStop0
    .attr("offset", gradientData[0].offset)
    .attr("stop-color", isInGreen ? gradientData[0].colorGreen : gradientData[0].colorRed)
    .raise();

  linearGradientStop1
    .attr("offset", gradientData[1].offset)
    .attr("stop-color", gradientData[1].color)
    .raise();

  svg.append("path")
    .data([data])
    .attr("class", "area")
    .attr("d", areaData)
  // .lower();
}

const Chart = ({
  yDomain,
  selectedTab,
  fiveYearData,
  isLoading,
  showTooltip,
  setShowTooltip,
  isInGreenToday,
  previousClose,
}) => {
  const svg = useRef();
  const chart = useRef();
  const yAxis = useRef();
  const xAxis = useRef();
  const linearGradient = useRef();
  const linearGradientStop0 = useRef();
  const linearGradientStop1 = useRef();
  const area = useRef();
  const clippedPath = useRef();
  const yAxisGrid = useRef();
  const bisectLine = useRef();
  const tooltipGroup = useRef();
  const tooltip = useRef();
  const mouseContainer = useRef();
  const focusPoint = useRef();
  const divContainer = useRef();
  const previousCloseLine = useRef();
  const previousCloseText = useRef();

  const [height, setHeight] = useState(600);
  const [width, setWidth] = useState(600);

  const setDimensions = () => {
    const height = document.body.clientHeight > 812 ? 300 : document.body.clientHeight * .3
    const getWidth = () => {
      const clientWidth = document.body.clientWidth;
      if (clientWidth - 80 > 600) {
        return 600
      }

      if (clientWidth < 500) {
        return clientWidth - 60 - 40;
      }

      return clientWidth - 80
    }
    const width = getWidth();
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
    divContainer.current = d3.select("#container")
      .append('div')
      .style('display', 'flex')
      .attr('class', 'outerDivContainer noselect')
      .append('div')
      .attr('class', 'divContainer');

    svg.current = divContainer.current.append("svg")
      .attr('transform', `translate(${0}, ${0})`)
      .attr('overflow', 'visible');

    linearGradient.current = svg.current.append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("gradientUnits", "userSpaceOnUse")


    linearGradientStop0.current = linearGradient.current
      .append("stop");


    linearGradientStop1.current = linearGradient.current
      .append("stop");

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

    previousCloseLine.current = svg.current
      .append("line")
      .attr('class', 'previousCloseLine')
      .attr("style", "stroke:black; stroke-width:0.5; stroke-dasharray: 2 9;")
      .attr("x1", 0)

    tooltipGroup.current = svg.current.append("g");

    mouseContainer.current = divContainer.current
      .append("div")
      .attr('class', 'mouseContainer')
      .style('transform', `translate(${0}px, ${0}px)`)
      .on('mouseover', function () {
        setShowTooltip(true);
      })
      .on('touchstart', function () {
        setShowTooltip(true);
      })

    previousCloseText.current = mouseContainer.current
      .append('div')
      .attr('class', 'previousCloseText')

    tooltip.current = mouseContainer.current
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)

    focusPoint.current = svg.current
      .append("circle")
      .attr("class", "y")
      .attr("r", 3)
      .style("opacity", "0");
  }

  useEffect(() => {
    if (bisectLine.current && tooltip.current && focusPoint.current) {
      if (showTooltip) {
        bisectLine.current
          .style("opacity", "1");

        tooltip.current
          .style("opacity", "1")

        focusPoint.current
          .style("opacity", "1")

      } else {
        bisectLine.current
          .style("opacity", "0");

        tooltip.current
          .style("opacity", "0")

        focusPoint.current
          .style("opacity", "0")
      }
    }


  }, [showTooltip])

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
      bisectLine: bisectLine.current,
      tooltipGroup: tooltipGroup.current,
      tooltip: tooltip.current,
      mouseContainer: mouseContainer.current,
      focusPoint: focusPoint.current,
      linearGradientStop0: linearGradientStop0.current,
      linearGradientStop1: linearGradientStop1.current,
      divContainer: divContainer.current,
      isInGreenToday,
      previousCloseLine: previousCloseLine.current,
      previousClose,
      previousCloseText: previousCloseText.current,
    })
  }, [yDomain, height, width, selectedTab, fiveYearData, isLoading, previousClose])

  return (
    null
  );
}

export default Chart;
