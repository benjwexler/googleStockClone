
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import moment, { utc } from 'moment';

const utcOffset = -5;
const margin = 40;

const getLastFiveDaysDomain = () => {
  const getDaysToSubtract = () => {
    const dayOfWeekToday = moment().day();
    switch (dayOfWeekToday) {
      case 0:
        return 2
      case 6:
        return 1
      default:
        return 0;

    }
  }

  const daysToSubtract = getDaysToSubtract();
  return [moment().add(utcOffset, 'hours').subtract(5 + daysToSubtract, 'days'), moment().add(utcOffset, 'hours').subtract(daysToSubtract, 'days')];
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

const getMonthsDomain = (months) => {
  const monthAgo = moment().subtract(months, 'months');
  return [monthAgo.add(getDaysToAdd(monthAgo), 'days'), moment()]
}



const yearToDateDomain = () => {
  const startOfYearDate = moment().startOf('year')
  return [startOfYearDate.add(getDaysToAdd(startOfYearDate), 'days').add(utcOffset, 'hours'), moment().add(utcOffset, 'hours')]
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
      ticks: d3.timeHour.every(3),
      data: [
        {
          x: new Date(2000, 0, 1, 8 + utcOffset),
          y: 20,
        },
        {
          x: new Date(2000, 0, 1, 9.5 + utcOffset),
          y: 150,
        },
        {
          x: new Date(2000, 0, 1, 11 + utcOffset),
          y: 80,
        },
        {
          x: new Date(2000, 0, 1, 14 + utcOffset),
          y: 150,
        },
        {
          x: new Date(2000, 0, 1, 17 + utcOffset),
          y: 150,
        },

      ]
    },
    1: {
      domain: getLastFiveDaysDomain(),
      ticks: d3.utcDay.every(1),
      data: [

        {
          x: moment('2020-03-18').add(utcOffset, 'hours'),
          y: 80,
        },
        {
          x: moment('2020-03-19').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2020-03-20').add(utcOffset, 'hours'),
          y: 120,
        },

      ]
    },
    2: {
      domain: getMonthsDomain(1),
      ticks: 6,
      data: [

        {
          x: moment('2020-02-23').add(utcOffset, 'hours'),
          y: 80,
        },

        {
          x: moment('2020-02-26').add(utcOffset, 'hours'),
          y: 120,
        },
        {
          x: moment('2020-03-19').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2020-03-22').add(utcOffset, 'hours'),
          y: 20,
        },
        {
          x: moment('2020-03-23').add(utcOffset, 'hours'),
          y: 20,
        },
      ]
    },
    3: {
      domain: getMonthsDomain(6),
      ticks: 3,
      data: [
        {
          x: moment('2019-12-23').add(utcOffset, 'hours'),
          y: 130,
        },

        {
          x: moment('2020-02-23').add(utcOffset, 'hours'),
          y: 80,
        },
        {
          x: moment('2020-03-19').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2020-03-22').add(utcOffset, 'hours'),
          y: 20,
        },
        {
          x: moment('2020-03-23').add(utcOffset, 'hours'),
          y: 20,
        },
      ]
    },
    4: {
      domain: yearToDateDomain(),
      ticks: date.getMonth(),
      data: [
        {
          x: moment('2020-01-01').add(utcOffset, 'hours'),
          y: 130,
        },

        {
          x: moment('2020-02-23').add(utcOffset, 'hours'),
          y: 80,
        },
        {
          x: moment('2020-03-19').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2020-03-22').add(utcOffset, 'hours'),
          y: 20,
        },
        {
          x: moment('2020-03-23').add(utcOffset, 'hours'),
          y: 20,
        },
      ],
    },
    5: {
      domain: getYearsDomain(1),
      ticks: 3,
      data: [
        {
          x: moment('2020-01-01').add(utcOffset, 'hours'),
          y: 130,
        },

        {
          x: moment('2020-02-23').add(utcOffset, 'hours'),
          y: 80,
        },
        {
          x: moment('2020-03-19').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2020-03-22').add(utcOffset, 'hours'),
          y: 20,
        },
        {
          x: moment('2020-03-23').add(utcOffset, 'hours'),
          y: 20,
        },
      ],
    },
    6: {
      domain: getYearsDomain(5),
      ticks: 5,
      data: [
        {
          x: moment('2015-04-01').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2017-01-01').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2017-02-01').add(utcOffset, 'hours'),
          y: 140,
        },
        {
          x: moment('2017-03-01').add(utcOffset, 'hours'),
          y: 80,
        },
        {
          x: moment('2018-04-01').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2019-01-01').add(utcOffset, 'hours'),
          y: 130,
        },

        {
          x: moment('2020-01-23').add(utcOffset, 'hours'),
          y: 80,
        },
        {
          x: moment('2020-02-19').add(utcOffset, 'hours'),
          y: 180,
        },
        {
          x: moment('2020-03-22').add(utcOffset, 'hours'),
          y: 20,
        },
      ],
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
}) => {
  clippedPath
    .attr("width", width)
    .attr("height", height);



  d3.selectAll("circle").remove();
  d3.selectAll(".line").remove();
  d3.selectAll(".area").remove();

  const data = getAxisXInfo(selectedTab).data
  console.log('data', data)

  const maxY = Math.max.apply(Math, data.map(function (o) { return o.y; }))
  const minY = Math.min.apply(Math, data.map(function (o) { return o.y; }))
  console.log('maxY', maxY)
  const domain = getAxisXInfo(selectedTab).domain

  var xScale = d3.scaleUtc()
    .domain(domain)
    .nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([minY, maxY])

  yAxisGrid
    .call(d3.axisLeft(yScale)
      .ticks(Math.round(height / 50))
      .tickSize(-width)
      .tickFormat("")

    )

  var yGridTBottomTick = d3.select(".yAxisGrid .tick")
    .style("display", "none")

  var line = d3.line()
    .x(function (d, i) {
      return xScale(d.x);
    })
    .y(function (d) { return yScale(d.y); }) // set the y values for the line generator 

  svg.append("path")
    .datum(getAxisXInfo(selectedTab).data) // 10. Binds data to the line 
    .attr("class", "line") // Assign a class for styling 
    .attr("d", line) // 11. Calls the line generator
    .attr('fill', 'none')
    .attr('stroke', 'rgb(230, 74, 25)')
    .attr('stroke-width', '2.5px')
    .raise();

  yAxis
  .attr('class', 'yAxis')
    .call(d3.axisLeft(yScale)
      .ticks(Math.round(height / 50))
      .tickSize(0)
    )

  xAxis
    .attr('transform', `translate(0, ${height})`)
    .attr('class', 'xAxis')
    .call(d3.axisBottom(xScale)
      .ticks(getAxisXInfo(selectedTab).ticks)
      // .tickSize(10)
      .tickSizeOuter(0)
      .tickSizeInner(8)
    );

  const circle = svg.selectAll()
    .data(getAxisXInfo(selectedTab).data)

  circle
    .enter()
    .append("circle")
    .attr("class", "dots")
    .attr("r", 2.5)
    .attr('fill', 'red')
    .attr("cx", function (d) { return xScale(d.x); })
    .attr("cy", function (d) { return yScale(d.y); });




  linearGradient
    .attr("x1", 0).attr("y1", yScale(maxY))
    .attr("x2", 0).attr("y2", yScale(minY))

  var areaData = d3.area()
    .x(function (d) { return xScale(d.x); })
    .y0(height)
    .y1(function (d) { return yScale(d.y); });

  svg.append("path")
    .data([getAxisXInfo(selectedTab).data])
    .attr("class", "area")
    .attr("d", areaData)
    .lower();

}

const Chart = ({ yDomain, selectedTab }) => {
  const svg = useRef();
  const chart = useRef();
  const yAxis = useRef();
  const xAxis = useRef();
  const linearGradient = useRef();
  const area = useRef();
  const clippedPath = useRef();
  const yAxisGrid = useRef();

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
      yAxisGrid: yAxisGrid.current
    })
  }, [yDomain, height, width, selectedTab])


  return (
    null
  );
}

export default Chart;
