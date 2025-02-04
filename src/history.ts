export type tableRow = [number, number | null, string, string, string];

const toMilliseconds = (time: string): number | null => {
  const regex = /(?:([\d]+)')?([\d]+)"([\d]+)/;
  const match = time.match(regex);
  if (!match) {
    return null;
  }

  const minutes = match[1] ? parseInt(match[1], 10) : 0;
  const seconds = parseInt(match[2], 10);
  const milliseconds = parseInt(match[3], 10);

  return minutes * 60000 + seconds * 1000 + milliseconds;
};

const toDateTime = (date: string): number | null => {
  const dateTime = new Date(date).getTime();
  if (isNaN(dateTime)) {
    return null;
  }
  return dateTime;
};

export class History {
  config: {
    rowIndexes: number[];
  };

  constructor(seriesName: string) {
    let rowIndexes: number[];
    switch (seriesName) {
      case "mkwii":
        rowIndexes = [0, 1, 2, 4, 11];
        break;
      case "mk64":
        rowIndexes = [0, 1, 3, 4, 6];
        break;
      default:
        rowIndexes = [0, 1, 2, 3, 4];
        break;
    }
    this.config = {
      rowIndexes,
    };
  }

  getTableData = () => {
    const rowIndexes = this.config.rowIndexes;

    const h2Elements = document.querySelectorAll<HTMLHeadingElement>("h2");
    let targetH2: HTMLHeadingElement | null = null;

    for (const h2 of Array.from(h2Elements)) {
      const h2Text = h2.textContent?.trim() ?? "";
      if (h2Text.includes("History") && !h2Text.includes("Graph")) {
        targetH2 = h2;
        break;
      }
    }
    if (!targetH2) {
      return [];
    }
    let nextElem: Element | null = targetH2.nextElementSibling;

    if (!nextElem || !(nextElem instanceof HTMLTableElement)) {
      return [];
    }

    const tableData: tableRow[] = [];
    const rows = nextElem.querySelectorAll<HTMLTableRowElement>("tr");
    rows.forEach((tr) => {
      const cells = tr.querySelectorAll<HTMLTableCellElement>("td");
      const rowData = Array.from(cells).map((td, index) => {
        if (index !== rowIndexes[3]) {
          return td.textContent?.trim() ?? "";
        }
        return td.querySelector("img")?.src ?? "";
      });
      if (rowData.length === 0) {
        return;
      }
      const dateTime = toDateTime(rowData[rowIndexes[0]]);
      if (dateTime === null) {
        return;
      }
      tableData.push([
        dateTime,
        toMilliseconds(rowData[rowIndexes[1]]),
        rowData[rowIndexes[2]],
        rowData[rowIndexes[3]],
        rowData[rowIndexes[4]],
      ]);
    });
    tableData.push([
      new Date().getTime(),
      tableData.at(-1)![1],
      tableData.at(-1)![2],
      tableData.at(-1)![3],
      tableData.at(-1)![4],
    ]);
    return tableData;
  };

  insertChartDiv = () => {
    const mainElement = document.querySelector("#main");
    if (!mainElement) {
      return null;
    }
    const h2Elements = document.querySelectorAll<HTMLHeadingElement>("h2");
    let targetH2: HTMLHeadingElement | null = null;

    for (const h2 of Array.from(h2Elements)) {
      if ((h2.textContent?.trim() ?? "").endsWith(":")) {
        targetH2 = h2;
        break;
      }
    }
    if (!targetH2) {
      return null;
    }

    const chartTitle = document.createElement("h2");
    chartTitle.textContent = "WR History Graph";
    mainElement.insertBefore(chartTitle, targetH2);

    const chartDiv = document.createElement("div");
    chartDiv.id = "chart";
    mainElement.insertBefore(chartDiv, targetH2);

    return chartDiv;
  };
}
