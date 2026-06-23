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
  emergency: null,
  timestamp: new Date().toISOString()
};
