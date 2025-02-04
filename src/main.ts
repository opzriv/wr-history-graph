import "./style.css";
import { History, tableRow } from "./history";

declare const ApexCharts: any;
let ApexChartsLocal: any;

const millisecondsToString = (value: number): string => {
  const milliseconds = value % 1000;
  const seconds = Math.floor((value / 1000) % 60);
  const minutes = Math.floor((value / 60000) % 60);
  return `${minutes}'${String(seconds).padStart(2, "0")}"${String(
    milliseconds.toFixed(0)
  ).padStart(3, "0")}`;
};

const getHistory = (): History => {
  const url = window.location.href;
  const seriesName = url.split("/")[3];
  return new History(seriesName);
};

const drawChart = (data: tableRow[]) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      height: 400,
      width: "90%",
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
    },
    markers: {
      size: 5,
    },
    stroke: {
      curve: "stepline",
    },
    series: [
      {
        name: "history",
        data: data.map((d) => ({
          x: d[0],
          y: d[1],
          player: d[2],
          nation: d[3],
          duration: d[4],
        })),
      },
    ],
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const date = new Date(data.x).toLocaleDateString();
        const time = data.y;
        const player = (data as any).player;
        const nation = (data as any).nation;
        const duration = (data as any).duration;

        return `
          <div style="padding:10px; top:1000px">
            <strong>Date:</strong> ${date}<br/>
            <strong>Time:</strong> ${millisecondsToString(time)}<br/>
            <strong>Player:</strong> ${player}<br/>
            <strong>Nation:</strong> <img src="${nation}"><br/>
            <strong>Duration:</strong> ${duration}
          </div>
        `;
      },
      followCursor: true,
    },
    xaxis: {
      type: "datetime",
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      title: {
        text: "Time",
      },
      labels: {
        formatter: millisecondsToString,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
    },
  };

  const chart = new ApexChartsLocal(document.querySelector("#chart"), options);
  chart.render();
};

const main = () => {
  const history = getHistory();
  const chartDiv = history.insertChartDiv();
  if (!chartDiv) {
    return;
  }
  const tableData = history.getTableData();
  drawChart(tableData);
};

if (import.meta.env.DEV) {
  import("apexcharts").then((lib) => {
    ApexChartsLocal = lib.default || lib;
    main();
  });
} else {
  ApexChartsLocal = ApexCharts;
  main();
}
