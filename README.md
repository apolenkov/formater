# Formater - Bybit to IntelInvest Converter

A utility tool that generates properly formatted files for importing trading data from Bybit exchange
into [IntelInvest](https://intelinvest.ru/).

## Overview

This tool addresses the limitations of the current IntelInvest integration with Bybit, which doesn't properly handle
import start dates and has other inconsistencies. The formatter ensures your trading data is correctly processed and
imported into IntelInvest for accurate portfolio tracking and analysis.

## Features

- Exports Bybit trading history and converts it to IntelInvest-compatible CSV format
- Properly handles custom date ranges for data export
- Maintains transaction integrity and chronological order
- Ensures proper currency pair formatting
- Detailed logging for troubleshooting

## Prerequisites

- Node.js (v18.0.0 or higher)
- Yarn (v1.22.0 or higher)
- Bybit API credentials (API key and secret)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/[username]/formater.git
   cd formater
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a `.env` file in the project root with your Bybit API credentials:
   ```
    BYBIT_API_KEY=your_api_key_here
    BYBIT_API_SECRET=your_api_secret_here
   ```

## Usage

### Basic Usage

Run the Bybit exporter with default settings (last month to today):

```bash
yarn bybit
```

### Custom Date Range

Specify a custom date range for export:

```bash
yarn bybit -- --start-date 2023-01-01 --end-date 2023-12-31
```

### Command Line Arguments

- `-s, --start-date <date>`: Start date in YYYY-MM-DD format (default: one month ago)
- `-e, --end-date <date>`: End date in YYYY-MM-DD format (default: today)
- `-h, --help`: Display help information
- `-V, --version`: Display version information

### Debug Mode

For troubleshooting, you can run the script in debug mode:

```bash
yarn bybit:debug
```

## Output

The script generates a CSV file in the output directory with the naming format:

```bash
bybit_trades_[start-date]to[end-date].csv
```

This file is ready to be imported into IntelInvest.

## Importing to IntelInvest

1. Log in to your [IntelInvest](https://intelinvest.ru/) account
2. Navigate to the Import section
3. Select "CSV Import" option
4. Upload the generated CSV file
5. Follow the on-screen instructions to complete the import

## Docker Support (Coming Soon)

Docker support is planned for future releases to simplify deployment and usage.

## Development

### Available Scripts

- `yarn format`: Format code using Prettier
- `yarn format:dry`: Check formatting without making changes
- `yarn lint`: Run ESLint to check code quality
- `yarn fix`: Run ESLint with auto-fix
- `yarn test`: Run tests
- `yarn test:coverage`: Run tests with coverage report

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Should do in future...

- Wrap to Docker
- Use typescript
- Use codecov report token
- Add support for additional Bybit data types (Earn values)
- Add support for additional Binance data types (Earn values) and trades

## License

MIT License
