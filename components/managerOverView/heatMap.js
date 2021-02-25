import React, { useEffect, useState, useRef } from "react";
import HighchartsReact from "highcharts-react-official";
import HighCharts from "highcharts";
import { zip } from "lodash";

if (typeof HighCharts === "object") {
  require("highcharts/modules/heatmap")(HighCharts);
  require("highcharts/modules/exporting")(HighCharts);
}

function getPointCategoryName(point, dimension) {
  const series = point.series;
  const isY = dimension === "y";
  const axis = series[isY ? "yAxis" : "xAxis"];

  return axis.categories[point[isY ? "y" : "x"]];
}

const heatMap = (props) => {
  const { data, title } = props;

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const [options, setOptions] = useState({
    chart: {
      type: "heatmap",

      plotBorderWidth: 1,
    },

    xAxis: {
      categories: weekDays.concat(`<b>TOTAL</b>`),
    },

    colorAxis: {
      min: 0,
      minColor: "#FFFFFF",
      maxColor: HighCharts.getOptions().colors[0],
    },
    legend: {
      align: "right",
      layout: "vertical",
      margin: 0,
      verticalAlign: "top",
      y: 25,
      symbolHeight: 280,
    },
    accessibility: {
      point: {
        descriptionFormatter: function (point) {
          const ix = point.index + 1;
          const xName = getPointCategoryName(point, "x");
          const yName = getPointCategoryName(point, "y");
          const val = point.value;

          return ix + ". " + xName + " lessons " + yName + ", " + val + ".";
        },
      },
    },
    colorAxis: {
      min: 0,
      minColor: "#FFFFFF",
      maxColor: "#1890ff",
    },

    tooltip: {
      formatter: function () {
        return `<b> ${getPointCategoryName(this.point, "y")}</b>
         <br/>
         <b>${this.point.value}</b> lessons on <b>${getPointCategoryName(
          this.point,
          "x"
        )}</b>`;
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            yAxis: {
              labels: {
                formatter: function () {
                  return this.value.charAt(0);
                },
              },
            },
          },
        },
      ],
    },
    credits: {
      enabled: false,
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const yCategories = data.map((item) => item.name).concat("<b>TOTAL</b>");
    const rowData = data.map((item) => {
      const ary = new Array(7).fill(0);
      const courses = item.courses
        .map((course) => course.classTime)
        .flat()
        .map((item) => item?.split(" ")[0]);

      courses.forEach((weekday) => {
        const index = weekDays.findIndex((item) => item === weekday);

        ary[index] += 1;
      });

      return ary.concat(ary.reduce((acc, cur) => acc + cur));
    });

    const sourceData = zip(...rowData)
      .map((columnAry, index) => {
        const len = columnAry.length;
        const result = [];
        let i = 0;

        for (i = 0; i < len; i++) {
          result.push([index, i, columnAry[i]]);
        }

        result.push([
          index,
          i,
          result.reduce((acc, cur) => {
            return acc + cur[2];
          }, 0),
        ]);

        return result;
      })
      .flat();

    setOptions({
      title: {
        text: `<span style="text-transform: capitalize">${title}</span>`,
      },
      yAxis: {
        categories: yCategories,
        title: null,
        reversed: true,
      },
      series: [
        {
          name: "Lessons per weekday",
          borderWidth: 1,
          data: sourceData,
          dataLabels: {
            enabled: true,
            color: "#000000",
          },
        },
      ],
    });
  }, [data]);

  const charRef = useRef(null);
  useEffect(() => {
    const { chart } = charRef.current;

    setTimeout(() => {
      chart.reflow();
    }, 30);
    return () => {};
  }, []);

  return (
    <HighchartsReact options={options} highcharts={HighCharts} ref={charRef} />
  );
};

export default heatMap;
