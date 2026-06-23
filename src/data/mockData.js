export const mockData = {
  traffic: {
    roads: [
      { id:"ab_road", name:"AB Road BRTS", 
        coords:[[22.7196,75.8577],[22.7180,75.8650]], 
        speed:8, status:"heavy", phase:2 },
      { id:"vijay_nagar", name:"Vijay Nagar Main",
        coords:[[22.7523,75.8890],[22.7490,75.8950]],
        speed:34, status:"flowing", phase:0 },
      { id:"palasia", name:"Palasia Square",
        coords:[[22.7196,75.8700],[22.7220,75.8750]],
        speed:18, status:"moderate", phase:1 },
      { id:"bypass", name:"Bypass Road",
        coords:[[22.6900,75.8400],[22.6950,75.8600]],
        speed:42, status:"flowing", phase:0 },
      { id:"rajwada", name:"Rajwada Area",
        coords:[[22.7196,75.8500],[22.7160,75.8520]],
        speed:11, status:"heavy", phase:2 }
    ],
    avg_speed: 28,
    congested_count: 3
  },
  parking: {
    lots: [
      { id:"treasure_island", name:"Treasure Island Mall",
        lat:22.7523, lng:75.8890, capacity:200, occupied:153,
        fill_pct:76.5, eta_full:23 },
      { id:"c21", name:"C21 Mall Parking",
        lat:22.7196, lng:75.8800, capacity:150, occupied:45,
        fill_pct:30, eta_full:90 },
      { id:"rajwada_park", name:"Rajwada Parking",
        lat:22.7180, lng:75.8510, capacity:80, occupied:76,
        fill_pct:95, eta_full:5 },
      { id:"phoenix", name:"Phoenix Citadel",
        lat:22.7350, lng:75.8750, capacity:300, occupied:120,
        fill_pct:40, eta_full:60 }
    ]
  },
  ev: {
    chargers: [
      { id:"vijay_hub", name:"Vijay Nagar Supercharger",
        lat:22.7523, lng:75.8890, load:84,
        bays_total:15, bays_free:2,
        suggestion:"Try Palasia Hub — only 12% load, 3 min away" },
      { id:"palasia_hub", name:"Palasia Shopping Hub",
        lat:22.7196, lng:75.8700, load:12,
        bays_total:30, bays_free:26, suggestion:null },
      { id:"bhawarkua", name:"Bhawarkua Transit Charging",
        lat:22.7050, lng:75.8600, load:45,
        bays_total:15, bays_free:8, suggestion:null },
      { id:"rajwada_ev", name:"Rajwada Chowk Charging",
        lat:22.7180, lng:75.8510, load:80,
        bays_total:12, bays_free:2,
        suggestion:"Try Bhawarkua — 45% load, 4 min away" }
    ]
  },
  petrol: {
    pumps: [
      { id:"hp_vijay", name:"HP Petrol Vijay Nagar",
        lat:22.7510, lng:75.8870, queue:4,
        predicted_queue:6, congestion:"moderate", recommended:false },
      { id:"iocl_palasia", name:"Indian Oil Palasia",
        lat:22.7210, lng:75.8720, queue:1,
        predicted_queue:1, congestion:"clear", recommended:true },
      { id:"bpcl_ab", name:"BPCL AB Road",
        lat:22.7196, lng:75.8620, queue:7,
        predicted_queue:9, congestion:"heavy", recommended:false },
      { id:"hp_bypass", name:"HP Bypass Road",
        lat:22.6920, lng:75.8500, queue:2,
        predicted_queue:2, congestion:"clear", recommended:false }
    ],
    best_pump_id: "iocl_palasia"
  },
  infra: {
    boundary: {
      id: "indore_boundary",
      name: "Indore City Municipal Boundary",
      coords: [
        [22.7800, 75.8000],
        [22.8000, 75.8500],
        [22.7900, 75.9200],
        [22.7500, 75.9600],
        [22.6800, 75.9400],
        [22.6400, 75.8800],
        [22.6300, 75.8000],
        [22.6700, 75.7600],
        [22.7300, 75.7700],
        [22.7800, 75.8000]
      ],
      area: "276 sq km",
      population: "3.2 Million",
      cleanliness_ranking: "1st in India (Swachh Survekshan)",
      aqi: 76,
      smart_mobility_score: 92
    },
    metro: {
      line: {
        id: "metro_yellow_line",
        name: "Indore Metro Yellow Line (Ring Line)",
        status: "Testing Phase",
        progress: 82,
        length: "31.55 km",
        fleet: "25 Trains (3-Coach)",
        frequency: "6 mins",
        coords: [
          [22.7224, 75.8012],
          [22.7500, 75.8050],
          [22.7650, 75.8150],
          [22.7750, 75.8450],
          [22.7523, 75.8890],
          [22.7440, 75.8970],
          [22.7240, 75.9080],
          [22.7196, 75.8700],
          [22.7160, 75.8640],
          [22.7180, 75.8510],
          [22.7240, 75.8360],
          [22.7224, 75.8012]
        ]
      },
      stations: [
        { id: "stn_airport", name: "Devi Ahilya Bai Holkar Airport Metro Station", lat: 22.7224, lng: 75.8012, ridership: 12500, status: "Testing Completed", connection: "Airport Terminal 1 & 2" },
        { id: "stn_super_1", name: "Super Corridor Stn 1 Metro Station", lat: 22.7500, lng: 75.8050, ridership: 4200, status: "Under Construction", connection: "Feeder e-Bus Zone" },
        { id: "stn_mr10", name: "MR 10 Square Metro Station", lat: 22.7750, lng: 75.8450, ridership: 9800, status: "Testing Phase", connection: "Interstate Bus Terminal (ISBT)" },
        { id: "stn_vijay_nagar", name: "Vijay Nagar Metro Station", lat: 22.7523, lng: 75.8890, ridership: 24500, status: "Operational Prep", connection: "BRTS Corridor Interchange" },
        { id: "stn_radisson", name: "Radisson Square Metro Station", lat: 22.7440, lng: 75.8970, ridership: 18200, status: "Testing Phase", connection: "Auto & Taxi Stand" },
        { id: "stn_bengali", name: "Bengali Square Metro Station", lat: 22.7240, lng: 75.9080, ridership: 11000, status: "Under Construction", connection: "E-Rickshaw Hub" },
        { id: "stn_palasia", name: "Palasia Metro Station", lat: 22.7196, lng: 75.8700, ridership: 15400, status: "Under Construction", connection: "City Bus Feeder" },
        { id: "stn_railway", name: "Indore Junction Metro Station", lat: 22.7160, lng: 75.8640, ridership: 32000, status: "Operational Prep", connection: "Railway Central Station" },
        { id: "stn_rajwada", name: "Rajwada Metro Station", lat: 22.7180, lng: 75.8510, ridership: 28500, status: "Testing Phase", connection: "Historic Core Pedestrian Zone" }
      ]
    },
    squares: [
      { id: "sq_rajwada", name: "Rajwada Palace Square", lat: 22.7185, lng: 75.8537, congestion: "High", AQI: 84, cameras: 12, footfall: "65,000/day", info: "Historic Maratha royal square built by the Holkars, central market hub." },
      { id: "sq_chappan", name: "Chappan Dukan Street", lat: 22.7244, lng: 75.8732, congestion: "Low", AQI: 62, cameras: 8, footfall: "45,000/day", info: "Indore's famous 56-shop street food avenue, fully pedestrianized and clean." },
      { id: "sq_sarafa", name: "Sarafa Night Food Bazaar", lat: 22.7170, lng: 75.8500, congestion: "Moderate (Night Peak)", AQI: 72, cameras: 6, footfall: "30,000/night", info: "Jewelry market by day, bustling street food paradise by night." },
      { id: "sq_khajrana", name: "Khajrana Ganesh Square", lat: 22.7300, lng: 75.8980, congestion: "Moderate", AQI: 68, cameras: 10, footfall: "50,000/day", info: "Key intersection leading to the famous Khajrana Ganesh temple site." },
      { id: "sq_bhawarkuan", name: "Bhawarkuan Square", lat: 22.7000, lng: 75.8600, congestion: "High", AQI: 78, cameras: 14, footfall: "80,000/day", info: "Indore's primary coaching & university hub, high student pedestrian volume." },
      { id: "sq_lig", name: "LIG Chauraha", lat: 22.7370, lng: 75.8810, congestion: "Extreme", AQI: 95, cameras: 16, footfall: "95,000/day", info: "Major commuter junction connecting Ring Road and AB Link road." }
    ]
  },
  emergency: null,
  timestamp: new Date().toISOString()
};
