export interface CropTask {
  id: string;
  title: string;
  description: string;
  source?: string;
  stage: number;
  stageName: string;
  timeframe: string;
  isCompleted: boolean;
  order: number;
}

export interface CropStage {
  id: number;
  name: string;
  timeframe: string;
  tasks: CropTask[];
}

export const riceCropStages: CropStage[] = [
  {
    id: 1,
    name: "Pre-Planting",
    timeframe: "Weeks -4 to -3",
    tasks: [
      {
        id: "task-1-1",
        title: "Soil Testing & Site Selection",
        description: "Conduct a basic soil test to determine pH and nutrient status. Select a level field with good drainage and access to irrigation channels or pond water.",
        source: "Agritech TNAU",
        stage: 1,
        stageName: "Pre-Planting",
        timeframe: "Weeks -4 to -3",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-1-2",
        title: "Variety & Seed Procurement",
        description: "Choose a locally adapted high-yield variety (e.g., short-duration 100–120 days or medium 120–140 days types).",
        source: "Nextech Agri Solutions",
        stage: 1,
        stageName: "Pre-Planting",
        timeframe: "Weeks -4 to -3",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-1-3",
        title: "Seed Treatment",
        description: "Treat seed with recommended fungicide and insecticide seed dressings to protect against seedling diseases for up to 14 days.",
        source: "Arkansas Extension Service",
        stage: 1,
        stageName: "Pre-Planting",
        timeframe: "Weeks -4 to -3",
        isCompleted: false,
        order: 3
      }
    ]
  },
  {
    id: 2,
    name: "Nursery Establishment",
    timeframe: "Weeks -3 to -1",
    tasks: [
      {
        id: "task-2-1",
        title: "Nursery Bed Preparation",
        description: "Select a well-drained, level nursery site near water source; incorporate fine soil and organic matter. Form seedbeds 1–1.5 m wide with ease of water management.",
        source: "Agritech TNAU",
        stage: 2,
        stageName: "Nursery Establishment",
        timeframe: "Weeks -3 to -1",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-2-2",
        title: "Nursery Seeding",
        description: "Sow pre-germinated seeds thinly and cover with a 0.5 cm soil layer or mulch to retain moisture.",
        source: "icar-nrri.in",
        stage: 2,
        stageName: "Nursery Establishment",
        timeframe: "Weeks -3 to -1",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-2-3",
        title: "Watering & Thinning",
        description: "Maintain constant moisture; irrigate gently daily. Thin to avoid overcrowding so seedlings reach 14–20 days after sowing (DAS) at 4–6 leaves stage.",
        source: "Agritech TNAU",
        stage: 2,
        stageName: "Nursery Establishment",
        timeframe: "Weeks -3 to -1",
        isCompleted: false,
        order: 3
      },
      {
        id: "task-2-4",
        title: "Seedling Age Check",
        description: "Ensure seedlings are 15–25 days old before uprooting for transplanting.",
        source: "rkb-odisha.in",
        stage: 2,
        stageName: "Nursery Establishment",
        timeframe: "Weeks -3 to -1",
        isCompleted: false,
        order: 4
      }
    ]
  },
  {
    id: 3,
    name: "Main Field Preparation & Transplanting",
    timeframe: "Weeks -1 to 0",
    tasks: [
      {
        id: "task-3-1",
        title: "Land Preparation",
        description: "Plow or puddle the main field to soften soil; remove weeds and level surface for uniform water depth.",
        source: "www.slideshare.net",
        stage: 3,
        stageName: "Main Field Preparation & Transplanting",
        timeframe: "Weeks -1 to 0",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-3-2",
        title: "Puddling & Bund Repair",
        description: "Flood field with 5–10 cm of water; puddle to create a mud layer that reduces percolation. Check and repair field bunds to maintain 5–25 cm water depth during crop.",
        source: "Haifa Group",
        stage: 3,
        stageName: "Main Field Preparation & Transplanting",
        timeframe: "Weeks -1 to 0",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-3-3",
        title: "Transplanting",
        description: "Transplant 2–3 healthy seedlings per hill at 20×15 cm spacing, maintaining 30–36 hills/m². Clip tips of seedlings to minimize carryover of pests (e.g., hispa, caseworm) from nursery.",
        source: "Haifa Group, niphm.gov.in",
        stage: 3,
        stageName: "Main Field Preparation & Transplanting",
        timeframe: "Weeks -1 to 0",
        isCompleted: false,
        order: 3
      }
    ]
  },
  {
    id: 4,
    name: "Early Vegetative Growth",
    timeframe: "Weeks 0-4",
    tasks: [
      {
        id: "task-4-1",
        title: "Water Management",
        description: "Maintain 3–5 cm of standing water immediately after transplanting; avoid extreme drying or deep flooding.",
        source: "Haifa Group",
        stage: 4,
        stageName: "Early Vegetative Growth",
        timeframe: "Weeks 0-4",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-4-2",
        title: "Basal Fertilization",
        description: "Apply DAP and MoP as basal at transplanting (e.g., 50 kg N/ha equivalent in DAP; 50 kg K₂O/ha in MoP).",
        source: "IFDC",
        stage: 4,
        stageName: "Early Vegetative Growth",
        timeframe: "Weeks 0-4",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-4-3",
        title: "Weed Control",
        description: "Hand-weed or use rotary weeders at 2–3 weeks after transplanting to control flush of weeds.",
        stage: 4,
        stageName: "Early Vegetative Growth",
        timeframe: "Weeks 0-4",
        isCompleted: false,
        order: 3
      },
      {
        id: "task-4-4",
        title: "Scouting & Monitoring",
        description: "Field-scout every 3–5 days for pests, diseases, and beneficials; record counts to decide sprays.",
        source: "niphm.gov.in",
        stage: 4,
        stageName: "Early Vegetative Growth",
        timeframe: "Weeks 0-4",
        isCompleted: false,
        order: 4
      }
    ]
  },
  {
    id: 5,
    name: "Active Tillering & Mid-Season Management",
    timeframe: "Weeks 4-8",
    tasks: [
      {
        id: "task-5-1",
        title: "Nitrogen Top-Dressing",
        description: "First urea top-dress at 3–4 weeks after transplanting (4–5 leaf stage); flood within 3–5 days to reduce nitrogen losses. Second nitrogen split at panicle initiation (~8 weeks) if deficiency symptoms appear.",
        source: "Haifa Group",
        stage: 5,
        stageName: "Active Tillering & Mid-Season Management",
        timeframe: "Weeks 4-8",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-5-2",
        title: "Irrigation Management",
        description: "Continue shallow flooding (3–5 cm); practice alternate wetting and drying if advised to conserve water.",
        stage: 5,
        stageName: "Active Tillering & Mid-Season Management",
        timeframe: "Weeks 4-8",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-5-3",
        title: "Pest & Disease Control",
        description: "Seedling diseases protected by seed treatment—no early sprays. Apply first foliar insecticide spray at tillering stage; average of 2–4 sprays per season based on thresholds. Use IPM: combine cultural, biological, and chemical methods; remove volunteer plants and diseased parts.",
        source: "CropLife International, niphm.gov.in",
        stage: 5,
        stageName: "Active Tillering & Mid-Season Management",
        timeframe: "Weeks 4-8",
        isCompleted: false,
        order: 3
      }
    ]
  },
  {
    id: 6,
    name: "Reproductive Phase",
    timeframe: "Weeks 8-12",
    tasks: [
      {
        id: "task-6-1",
        title: "Panicle Initiation to Flowering",
        description: "This reproductive phase lasts about one month; ensure adequate nitrogen availability to maximize grain number.",
        source: "FAOHome",
        stage: 6,
        stageName: "Reproductive Phase",
        timeframe: "Weeks 8-12",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-6-2",
        title: "Third Spray & Fungicide",
        description: "Apply fungicides or insecticides at panicle initiation and/or flowering based on pest levels; avoid overuse of any single mode of action.",
        source: "niphm.gov.in",
        stage: 6,
        stageName: "Reproductive Phase",
        timeframe: "Weeks 8-12",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-6-3",
        title: "Water Level",
        description: "Maintain 5 cm flooding until 1 week before heading; then allow slight drainage to improve aeration.",
        stage: 6,
        stageName: "Reproductive Phase",
        timeframe: "Weeks 8-12",
        isCompleted: false,
        order: 3
      }
    ]
  },
  {
    id: 7,
    name: "Grain Filling & Ripening",
    timeframe: "Weeks 12-16",
    tasks: [
      {
        id: "task-7-1",
        title: "Grain Maturity",
        description: "Grain filling/ripening lasts ~1 month; monitor grain moisture—ideal harvesting moisture is 17–21% to minimize cracking.",
        source: "Haifa Group",
        stage: 7,
        stageName: "Grain Filling & Ripening",
        timeframe: "Weeks 12-16",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-7-2",
        title: "Drainage",
        description: "Drain fields 7–10 days before harvest to allow field entry and ease cutting.",
        stage: 7,
        stageName: "Grain Filling & Ripening",
        timeframe: "Weeks 12-16",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-7-3",
        title: "Quality Check",
        description: "Sample panicles daily once grains begin amber coloration; decide harvest timing by moisture meter.",
        stage: 7,
        stageName: "Grain Filling & Ripening",
        timeframe: "Weeks 12-16",
        isCompleted: false,
        order: 3
      }
    ]
  },
  {
    id: 8,
    name: "Harvesting & Post-Harvest",
    timeframe: "Weeks 16-18",
    tasks: [
      {
        id: "task-8-1",
        title: "Harvesting",
        description: "Harvest by hand or combine when ~80–85% of grains turn golden and field is dry.",
        source: "Haifa Group",
        stage: 8,
        stageName: "Harvesting & Post-Harvest",
        timeframe: "Weeks 16-18",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-8-2",
        title: "Threshing & Cleaning",
        description: "Thresh within 24 hours of cutting to reduce shattering losses; clean off chaff and unfilled grains.",
        stage: 8,
        stageName: "Harvesting & Post-Harvest",
        timeframe: "Weeks 16-18",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-8-3",
        title: "Drying",
        description: "Sun-dry or mechanical dry to 14% grain moisture for storage.",
        stage: 8,
        stageName: "Harvesting & Post-Harvest",
        timeframe: "Weeks 16-18",
        isCompleted: false,
        order: 3
      },
      {
        id: "task-8-4",
        title: "Storage",
        description: "Store in airtight, rodent-proof bins; monitor moisture and temperature regularly to prevent spoilage.",
        stage: 8,
        stageName: "Harvesting & Post-Harvest",
        timeframe: "Weeks 16-18",
        isCompleted: false,
        order: 4
      }
    ]
  },
  {
    id: 9,
    name: "Transportation & Marketing",
    timeframe: "Weeks 18+",
    tasks: [
      {
        id: "task-9-1",
        title: "Packaging & Logistics",
        description: "Bag paddy in jute or HDPE sacks; label with variety, moisture, and date. Arrange transport: coordinate with local aggregators or wholesalers 1–2 weeks before expected completion of drying.",
        stage: 9,
        stageName: "Transportation & Marketing",
        timeframe: "Weeks 18+",
        isCompleted: false,
        order: 1
      },
      {
        id: "task-9-2",
        title: "Market Linkages",
        description: "Compare farm-gate prices; negotiate contracts or forward sales to milling units.",
        stage: 9,
        stageName: "Transportation & Marketing",
        timeframe: "Weeks 18+",
        isCompleted: false,
        order: 2
      },
      {
        id: "task-9-3",
        title: "Record Keeping",
        description: "Record yield, input costs, and returns for next season's planning.",
        stage: 9,
        stageName: "Transportation & Marketing",
        timeframe: "Weeks 18+",
        isCompleted: false,
        order: 3
      }
    ]
  }
];

export function getAllTasks(): CropTask[] {
  return riceCropStages.flatMap(stage => stage.tasks);
}

export function getTaskById(taskId: string): CropTask | undefined {
  return getAllTasks().find(task => task.id === taskId);
}

export function updateTaskStatus(taskId: string, isCompleted: boolean): CropTask[] {
  const allTasks = getAllTasks();
  const updatedTasks = allTasks.map(task => 
    task.id === taskId ? { ...task, isCompleted } : task
  );
  return updatedTasks;
} 