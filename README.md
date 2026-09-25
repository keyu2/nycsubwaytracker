# NYST
**N**ew **Y**ork **S**ubway **T**racker is a real-time subway arrival and service information website.

I started this project because many subway trackers become unreliable during service changes. When trains are rerouted, skip stops, or run in separate sections, they often show an incomplete station list. This project tries to keep the full route visible while showing which stations currently have service.

The station page also includes a full-screen display mode that can be used as an arrival information board.

## Development
Install the dependencies and start the development server:

```bash
git clone https://github.com/keyu2/nyst.git
cd nyst
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

## Data

Subway schedules, real-time arrivals, and service alerts come from the [MTA’s public data feeds](https://www.mta.info/developers). Station accessibility and borough information come from [New York State Open Data](https://data.ny.gov/).

The site uses real-time data when it is available. Static GTFS data is used for the complete route structure and as a fallback.

## Attribution
This is an independent project and is not affiliated with or endorsed by the MTA.
MTA subway symbols, names, and related marks belong to the Metropolitan Transportation Authority. Transit data may be delayed, incomplete, or inaccurate.
