# KPI Builder

A web application for building and managing Key Performance Indicators (KPIs) for factory machines. This tool allows users to create custom KPIs using mathematical formulas based on machine variables, visualize the results, and save them for future reference.

## Features

- **Machine Selection**: Choose from different factory machines (CNC, Injection Molding, Packaging)
- **Dynamic Data Generation**: Load randomly generated time-series data for analysis and testing
- **Advanced Formula Editor**: Create formulas with syntax highlighting, auto-complete, and variable suggestions
- **Data Visualization**: 
  - View formula results in interactive ECharts charts
  - Proper scaling for both positive and negative values
  - View data in tabular format with pagination
- **KPI Management**:
  - Choose different aggregation methods (average, median, sum, integration, minimum, maximum)
  - Save, edit, and delete KPIs
  - View saved KPIs in a dashboard
- **User Experience**:
  - Sticky headers for easy navigation
  - Fullscreen chart viewing option

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: Material UI (MUI) v6
- **Language**: TypeScript
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Code Editor**: Monaco Editor with custom syntax highlighting and autocomplete
- **Data Grid**: MUI X Data Grid for tabular data display
- **Charts**: Apache ECharts for data visualization
- **Formula Parsing**: expr-eval for evaluating mathematical expressions
- **Data Formatting**: date-fns for date handling

## Potential improvements

- **useReducer**: some pages have many setXYZ calls, this could be done more cleanly via reducers

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Structure

### Pages

- **Home (/)**: Dashboard displaying all saved KPIs with options to create, edit, or delete
- **Create (/create)**: Interface for creating new KPIs
- **Edit KPI (/kpi/[id])**: Interface for editing existing KPIs

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Material UI](https://mui.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [ECharts](https://echarts.apache.org/)
- [expr-eval](https://github.com/silentmatt/expr-eval)
