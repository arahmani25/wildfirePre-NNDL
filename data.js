/**
 * WildfireGuard AI - Data Module
 * Contains sample images, prediction data, and configuration
 */

// Sample satellite images for demo
// In production, these would be actual satellite image URLs
const sampleImages = [
    {
        id: 1,
        label: "High Risk Area",
        description: "Dense vegetation + dry conditions",
        actualClass: "wildfire",
        confidence: 0.90,
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23d4a574' width='350' height='350'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23fff'%3EHigh Risk Zone%3C/text%3E%3C/svg%3E"
    },
    {
        id: 2,
        label: "Low Risk Area",
        description: "Water bodies + sparse vegetation",
        actualClass: "nowildfire",
        confidence: 0.88,
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%2356ab91' width='350' height='350'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23fff'%3ELow Risk Zone%3C/text%3E%3C/svg%3E"
    },
    {
        id: 3,
        label: "Active Fire",
        description: "Heat signature detected",
        actualClass: "wildfire",
        confidence: 0.92,
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23e63946' width='350' height='350'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23fff'%3EActive Fire%3C/text%3E%3C/svg%3E"
    },
    {
        id: 4,
        label: "Urban Area",
        description: "Developed land, low vegetation",
        actualClass: "nowildfire",
        confidence: 0.87,
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%237d8597' width='350' height='350'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23fff'%3EUrban Area%3C/text%3E%3C/svg%3E"
    },
    {
        id: 5,
        label: "Forest Area",
        description: "Dense forest, moderate risk",
        actualClass: "wildfire",
        confidence: 0.86,
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%23386641' width='350' height='350'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23fff'%3EForest Area%3C/text%3E%3C/svg%3E"
    },
    {
        id: 6,
        label: "Lake Region",
        description: "Water coverage, minimal risk",
        actualClass: "nowildfire",
        confidence: 0.91,
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='350'%3E%3Crect fill='%230077b6' width='350' height='350'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='%23fff'%3ELake Region%3C/text%3E%3C/svg%3E"
    }
];

// Model performance metrics
const modelMetrics = {
    accuracy: 0.952,
    precision: 0.948,
    recall: 0.956,
    f1Score: 0.952,
    trainingImages: 30250,
    validationImages: 6300,
    testImages: 6300,
    totalImages: 42850,
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001
};

// Dataset statistics
const datasetStats = {
    imageSize: "350x350px",
    wildfireImages: 22710,
    noWildfireImages: 20140,
    trainSplit: 0.70,
    testSplit: 0.15,
    validSplit: 0.15,
    source: "Canada Open Government Portal",
    api: "MapBox Satellite API"
};

// Risk categories and recommendations
const riskCategories = {
    high: {
        threshold: 0.70,
        label: "HIGH RISK",
        color: "#e63946",
        icon: "fa-fire",
        recommendations: [
            "⚠️ Immediate evacuation may be required",
            "🚒 Deploy firefighting resources to standby",
            "📢 Issue public alerts and warnings",
            "🚫 Restrict access to high-risk zones",
            "📊 Monitor continuously with satellite updates"
        ],
        businessAction: "Alert insurance clients, increase premium or deny coverage for new policies in this zone"
    },
    medium: {
        threshold: 0.40,
        label: "MEDIUM RISK",
        color: "#f77f00",
        icon: "fa-exclamation-triangle",
        recommendations: [
            "👁️ Monitor area closely for changes",
            "🌲 Implement vegetation management",
            "🧯 Ensure fire suppression equipment ready",
            "📋 Review evacuation plans",
            "🔔 Set up early warning systems"
        ],
        businessAction: "Flag for regular monitoring, apply standard risk pricing"
    },
    low: {
        threshold: 0.0,
        label: "LOW RISK",
        color: "#06d6a0",
        icon: "fa-check-circle",
        recommendations: [
            "✅ Area appears safe from wildfire",
            "🌍 Maintain standard monitoring protocols",
            "🌱 Continue sustainable land management",
            "📈 Safe for development and activities",
            "💚 Environmentally stable zone"
        ],
        businessAction: "Safe for standard coverage, competitive premium pricing available"
    }
};

// CNN Model Architecture Details
const modelArchitecture = [
    { layer: "Input", shape: "(350, 350, 3)", params: 0 },
    { layer: "Conv2D", filters: 32, kernel: "(3,3)", activation: "ReLU", params: 896 },
    { layer: "MaxPooling2D", pool: "(2,2)", params: 0 },
    { layer: "Conv2D", filters: 64, kernel: "(3,3)", activation: "ReLU", params: 18496 },
    { layer: "MaxPooling2D", pool: "(2,2)", params: 0 },
    { layer: "Conv2D", filters: 128, kernel: "(3,3)", activation: "ReLU", params: 73856 },
    { layer: "MaxPooling2D", pool: "(2,2)", params: 0 },
    { layer: "Conv2D", filters: 256, kernel: "(3,3)", activation: "ReLU", params: 295168 },
    { layer: "MaxPooling2D", pool: "(2,2)", params: 0 },
    { layer: "Flatten", shape: "(-1,)", params: 0 },
    { layer: "Dense", units: 512, activation: "ReLU", params: 1180160 },
    { layer: "Dropout", rate: 0.5, params: 0 },
    { layer: "Dense", units: 256, activation: "ReLU", params: 131328 },
    { layer: "Dropout", rate: 0.5, params: 0 },
    { layer: "Dense (Output)", units: 1, activation: "Sigmoid", params: 257 }
];

// Training history (sample data - would be real metrics from actual training)
const trainingHistory = {
    epochs: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    trainAccuracy: [0.72, 0.82, 0.87, 0.90, 0.92, 0.93, 0.94, 0.945, 0.950, 0.952, 0.954],
    valAccuracy: [0.70, 0.80, 0.85, 0.88, 0.90, 0.91, 0.92, 0.925, 0.930, 0.940, 0.952],
    trainLoss: [0.52, 0.41, 0.35, 0.28, 0.23, 0.19, 0.16, 0.14, 0.12, 0.11, 0.10],
    valLoss: [0.55, 0.43, 0.37, 0.30, 0.25, 0.21, 0.18, 0.16, 0.15, 0.13, 0.12]
};

// Business impact calculations
const businessImpact = {
    annualWildfireCost: 2.3e9, // $2.3 billion
    potentialSavings: 0.30, // 30% reduction in costs
    responseTmeImprovement: 0.30, // 30% faster
    riskPricingImprovement: 0.15, // 15% more accurate
    affectedAreas: 10000, // number of zones monitored
    alertsPerDay: 150,
    avgPremiumIncrease: 250 // dollars per high-risk policy
};

// Export data for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleImages,
        modelMetrics,
        datasetStats,
        riskCategories,
        modelArchitecture,
        trainingHistory,
        businessImpact
    };
}
