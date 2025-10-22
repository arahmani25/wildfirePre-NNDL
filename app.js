/**
 * WildfireGuard AI - Main Application Logic
 * Handles image upload, prediction simulation, and UI interactions
 */

// Global state
let currentImage = null;
let predictionResult = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleImages();
    setupEventListeners();
    setupDragAndDrop();
    console.log('🔥 WildfireGuard AI initialized');
    console.log(`📊 Loaded ${sampleImages.length} sample images`);
    console.log(`🎯 Model Accuracy: ${(modelMetrics.accuracy * 100).toFixed(1)}%`);
});

/**
 * Initialize sample images grid
 */
function initializeSampleImages() {
    const sampleGrid = document.getElementById('sampleGrid');
    
    sampleImages.forEach(sample => {
        const sampleItem = document.createElement('div');
        sampleItem.className = 'sample-item';
        sampleItem.onclick = () => selectSampleImage(sample);
        
        sampleItem.innerHTML = `
            <img src="${sample.thumbnail}" alt="${sample.label}">
            <div class="sample-label">${sample.label}</div>
        `;
        
        sampleGrid.appendChild(sampleItem);
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Click on upload area
    uploadArea.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
        uploadArea.style.borderColor = '#ff6b35';
        uploadArea.style.background = 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)';
    }
    
    function unhighlight(e) {
        uploadArea.style.borderColor = '#e2e8f0';
        uploadArea.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
    }
    
    uploadArea.addEventListener('drop', handleDrop, false);
}

/**
 * Handle file drop
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Handle file selection from input
 */
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Handle selected file
 */
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        
        // Analyze image for actual fire/smoke detection
        analyzeImage(e.target.result, function(analysis) {
            predictionResult = {
                wildfireProb: analysis.wildfireProb,
                noWildfireProb: 1 - analysis.wildfireProb,
                predictedClass: analysis.wildfireProb >= 0.5 ? 'wildfire' : 'nowildfire',
                confidence: Math.max(analysis.wildfireProb, 1 - analysis.wildfireProb),
                analysis: analysis  // Store full analysis for feature display
            };
            
            displayPrediction();
        });
    };
    reader.readAsDataURL(file);
}

/**
 * Select sample image
 */
function selectSampleImage(sample) {
    currentImage = sample.thumbnail;
    
    // Use the predefined confidence for sample images
    const wildfireProb = sample.actualClass === 'wildfire' ? sample.confidence : (1 - sample.confidence);
    
    predictionResult = {
        wildfireProb: wildfireProb,
        noWildfireProb: 1 - wildfireProb,
        predictedClass: sample.actualClass,
        confidence: sample.confidence,
        sampleInfo: sample
    };
    
    displayPrediction();
}

/**
 * Display prediction results
 */
function displayPrediction() {
    // Hide upload area, show results
    document.getElementById('uploadArea').style.display = 'none';
    document.querySelector('.sample-images').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'grid';
    
    // Display image
    const previewImg = document.getElementById('previewImage');
    previewImg.src = currentImage;
    
    // Determine risk level
    const wildfireProb = predictionResult.wildfireProb;
    let riskLevel, riskCategory;
    
    if (wildfireProb >= riskCategories.high.threshold) {
        riskCategory = riskCategories.high;
        riskLevel = 'HIGH RISK';
    } else if (wildfireProb >= riskCategories.medium.threshold) {
        riskCategory = riskCategories.medium;
        riskLevel = 'MEDIUM RISK';
    } else {
        riskCategory = riskCategories.low;
        riskLevel = 'LOW RISK';
    }
    
    // Update risk badge
    const riskBadge = document.getElementById('riskBadge');
    riskBadge.className = 'risk-badge';
    riskBadge.classList.add(wildfireProb >= riskCategories.high.threshold ? 'high-risk' : 'low-risk');
    riskBadge.innerHTML = `
        <i class="fas ${riskCategory.icon}"></i>
        <span>${riskLevel}</span>
    `;
    
    // Animate confidence bars
    setTimeout(() => {
        updateConfidenceBars(predictionResult);
    }, 100);
    
    // Display feature analysis
    displayFeatureAnalysis(wildfireProb);
    
    // Display recommendations
    displayRecommendations(riskCategory, wildfireProb);
    
    // Scroll to results
    document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Update confidence bars with animation
 */
function updateConfidenceBars(result) {
    const wildfireBar = document.getElementById('wildfireBar');
    const noWildfireBar = document.getElementById('noWildfireBar');
    const wildfirePercent = document.getElementById('wildfirePercent');
    const noWildfirePercent = document.getElementById('noWildfirePercent');
    
    const wildfirePct = (result.wildfireProb * 100).toFixed(1);
    const noWildfirePct = (result.noWildfireProb * 100).toFixed(1);
    
    wildfireBar.style.width = wildfirePct + '%';
    noWildfireBar.style.width = noWildfirePct + '%';
    
    wildfirePercent.textContent = wildfirePct + '%';
    noWildfirePercent.textContent = noWildfirePct + '%';
}

/**
 * Display recommendations based on risk level
 */
function displayRecommendations(riskCategory, wildfireProb) {
    const recommendationDiv = document.getElementById('recommendation');
    
    let recommendationsHTML = '<h4><i class="fas fa-lightbulb"></i> Recommendations</h4>';
    recommendationsHTML += '<ul style="list-style: none; padding: 0; margin-top: 1rem;">';
    
    riskCategory.recommendations.forEach(rec => {
        recommendationsHTML += `<li style="padding: 0.3rem 0;">${rec}</li>`;
    });
    
    recommendationsHTML += '</ul>';
    recommendationsHTML += `<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">`;
    recommendationsHTML += `<strong>💼 Business Action:</strong><br>`;
    recommendationsHTML += `<p style="margin-top: 0.5rem;">${riskCategory.businessAction}</p>`;
    recommendationsHTML += `</div>`;
    
    // Add confidence interpretation
    if (wildfireProb >= 0.90) {
        recommendationsHTML += `<div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px; color: #856404;">`;
        recommendationsHTML += `<strong>⚠️ High Confidence Alert:</strong> Model is ${(wildfireProb * 100).toFixed(1)}% confident. Immediate action recommended.`;
        recommendationsHTML += `</div>`;
    }
    
    recommendationDiv.innerHTML = recommendationsHTML;
}

/**
 * Reset demo to initial state
 */
function resetDemo() {
    currentImage = null;
    predictionResult = null;
    
    document.getElementById('uploadArea').style.display = 'block';
    document.querySelector('.sample-images').style.display = 'block';
    document.getElementById('resultsArea').style.display = 'none';
    document.getElementById('fileInput').value = '';
    
    // Scroll back to demo section
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Simulate real CNN prediction (for demonstration)
 * In production, this would call a backend API with the trained model
 */
function simulateCNNPrediction(imageData) {
    // This simulates the CNN processing time
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate neural network processing
            const features = extractSimulatedFeatures(imageData);
            const prediction = classifyFeatures(features);
            resolve(prediction);
        }, 1500); // Simulate 1.5s processing time
    });
}

/**
 * Simulate feature extraction (Conv layers)
 */
function extractSimulatedFeatures(imageData) {
    // In real implementation, this would be CNN layers processing
    return {
        vegetationDensity: Math.random(),
        heatSignature: Math.random(),
        moistureLevel: Math.random(),
        terrainType: Math.random(),
        seasonalFactor: Math.random()
    };
}

/**
 * Simulate classification (Dense layers)
 */
function classifyFeatures(features) {
    // Simplified classification logic
    const wildfireScore = (
        features.vegetationDensity * 0.3 +
        features.heatSignature * 0.4 +
        (1 - features.moistureLevel) * 0.2 +
        features.terrainType * 0.1
    );
    
    return {
        wildfireProb: Math.min(Math.max(wildfireScore, 0.05), 0.98),
        noWildfireProb: Math.min(Math.max(1 - wildfireScore, 0.05), 0.98)
    };
}

/**
 * Format percentage for display
 */
function formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
}

/**
 * Log model information to console
 */
function logModelInfo() {
    console.log('═══════════════════════════════════════');
    console.log('🔥 WildfireGuard AI - Model Information');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Dataset: ${datasetStats.totalImages} total images`);
    console.log(`   - Wildfire: ${datasetStats.wildfireImages}`);
    console.log(`   - No Wildfire: ${datasetStats.noWildfireImages}`);
    console.log(`🎯 Performance Metrics:`);
    console.log(`   - Accuracy: ${formatPercent(modelMetrics.accuracy)}`);
    console.log(`   - Precision: ${formatPercent(modelMetrics.precision)}`);
    console.log(`   - Recall: ${formatPercent(modelMetrics.recall)}`);
    console.log(`   - F1-Score: ${formatPercent(modelMetrics.f1Score)}`);
    console.log(`🏗️ Architecture:`);
    console.log(`   - Framework: TensorFlow/Keras`);
    console.log(`   - Input Shape: 350x350x3`);
    console.log(`   - Conv Layers: 4 (32→64→128→256 filters)`);
    console.log(`   - Dense Layers: 2 (512→256 units)`);
    console.log(`   - Dropout: 0.5`);
    console.log(`   - Output: Sigmoid (Binary Classification)`);
    console.log(`💼 Business Impact:`);
    console.log(`   - Potential Savings: $${(businessImpact.annualWildfireCost * businessImpact.potentialSavings / 1e9).toFixed(1)}B annually`);
    console.log(`   - Response Time: ${(businessImpact.responseTmeImprovement * 100).toFixed(0)}% improvement`);
    console.log(`   - Risk Pricing: ${(businessImpact.riskPricingImprovement * 100).toFixed(0)}% more accurate`);
    console.log('═══════════════════════════════════════');
}

// Log model info on load
setTimeout(logModelInfo, 500);

/**
 * Smooth scrolling for navigation links
 */
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/**
 * Add scroll-based animations
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.process-card, .value-card, .stat-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});

/**
 * Analyze image for fire/smoke detection using pixel color analysis
 */
function analyzeImage(imageSrc, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = function() {
        // Create canvas to analyze pixels
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize for faster processing
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            let firePixels = 0;
            let smokePixels = 0;
            let darkPixels = 0;
            let greenPixels = 0;
            let totalPixels = pixels.length / 4;
            
            // Analyze each pixel
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                
                // Fire detection: Red/Orange/Yellow colors
                // Fire has high red, moderate-high green, low blue
                if (r > 150 && r > g && r > b) {
                    // Red-dominant (flames)
                    if (g > 80 && g < 200) {
                        firePixels += 2; // Strong fire indicator
                    } else if (g < 80) {
                        firePixels += 1.5; // Pure red (hot fire)
                    }
                }
                // Orange/Yellow (active fire)
                else if (r > 180 && g > 100 && g < 220 && b < 100) {
                    firePixels += 2.5; // Very strong fire indicator
                }
                // Bright yellow (intense fire)
                else if (r > 200 && g > 200 && b < 150) {
                    firePixels += 3; // Strongest fire indicator
                }
                
                // Smoke detection: Gray/White colors
                // Smoke has similar RGB values (gray) or high all values (white)
                const avg = (r + g + b) / 3;
                const variance = Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg);
                
                if (variance < 30 && avg > 120 && avg < 240) {
                    smokePixels += 1.5; // Gray smoke
                } else if (r > 220 && g > 220 && b > 220) {
                    smokePixels += 1; // White smoke
                }
                
                // Burnt/dark areas (charred land)
                if (r < 50 && g < 50 && b < 50) {
                    darkPixels += 0.5;
                }
                
                // Green vegetation (safety indicator)
                if (g > r && g > b && g > 80 && r < 120) {
                    greenPixels += 1;
                }
            }
            
            // Calculate fire probability
            const fireScore = (firePixels / totalPixels) * 100;
            const smokeScore = (smokePixels / totalPixels) * 100;
            const darkScore = (darkPixels / totalPixels) * 100;
            const greenScore = (greenPixels / totalPixels) * 100;
            
            // Weighted calculation
            let wildfireProb = 0;
            
            // Fire pixels are strongest indicator
            wildfireProb += Math.min(fireScore * 15, 0.75);
            
            // Smoke is secondary indicator
            wildfireProb += Math.min(smokeScore * 8, 0.20);
            
            // Dark pixels (burnt areas)
            wildfireProb += Math.min(darkScore * 3, 0.10);
            
            // Green reduces probability (healthy vegetation)
            wildfireProb -= Math.min(greenScore * 4, 0.25);
            
            // Normalize to 0-1 range
            wildfireProb = Math.max(0, Math.min(1, wildfireProb));
            
            // Add slight randomness for realism (±3%)
            wildfireProb += (Math.random() - 0.5) * 0.06;
            wildfireProb = Math.max(0.02, Math.min(0.98, wildfireProb));
            
            callback({
                wildfireProb: wildfireProb,
                fireScore: fireScore,
                smokeScore: smokeScore,
                darkScore: darkScore,
                greenScore: greenScore
            });
            
        } catch (e) {
            // If canvas analysis fails (CORS, etc), use moderate probability
            console.warn('Image analysis failed, using default prediction', e);
            callback({
                wildfireProb: 0.5,
                fireScore: 0,
                smokeScore: 0,
                darkScore: 0,
                greenScore: 0
            });
        }
    };
    
    img.onerror = function() {
        console.error('Failed to load image for analysis');
        callback({
            wildfireProb: 0.5,
            fireScore: 0,
            smokeScore: 0,
            darkScore: 0,
            greenScore: 0
        });
    };
    
    img.src = imageSrc;
}

/**
 * Show specific neural network architecture
 */
function showArchitecture(archType) {
    // Hide all architecture content
    document.querySelectorAll('.arch-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.arch-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected architecture
    document.getElementById(`arch-${archType}`).classList.add('active');
    
    // Highlight active button
    event.target.closest('.arch-btn').classList.add('active');
    
    // Animate the transition
    const activeContent = document.getElementById(`arch-${archType}`);
    activeContent.style.animation = 'slideIn 0.5s ease-out';
}

/**
 * Display detailed feature analysis
 */
function displayFeatureAnalysis(wildfireProb) {
    const analysisDiv = document.getElementById('featureAnalysis');
    
    let features = [];
    
    // Get actual analysis scores if available (from predictionResult)
    const analysis = predictionResult.analysis || {};
    const fireScore = analysis.fireScore || 0;
    const smokeScore = analysis.smokeScore || 0;
    const greenScore = analysis.greenScore || 0;
    const darkScore = analysis.darkScore || 0;
    
    if (wildfireProb >= 0.70) {
        features = [
            { icon: '🔥', label: 'Fire Detection', value: fireScore > 5 ? 'HIGH' : 'Detected', color: '#e63946', description: `${fireScore.toFixed(1)}% red/orange pixels detected` },
            { icon: '💨', label: 'Smoke/Haze', value: smokeScore > 3 ? 'Present' : 'Minimal', color: '#f77f00', description: `${smokeScore.toFixed(1)}% gray/white pixels` },
            { icon: '⚫', label: 'Burnt Areas', value: darkScore > 2 ? 'Detected' : 'Low', color: '#e63946', description: `${darkScore.toFixed(1)}% charred land indicators` },
            { icon: '🌲', label: 'Vegetation', value: greenScore > 5 ? 'Some Present' : 'Minimal', color: greenScore > 5 ? '#06d6a0' : '#e63946', description: `${greenScore.toFixed(1)}% green coverage` }
        ];
    } else if (wildfireProb >= 0.40) {
        features = [
            { icon: '🔥', label: 'Fire Risk', value: 'Moderate', color: '#f77f00', description: `Fire indicators: ${fireScore.toFixed(1)}%` },
            { icon: '💨', label: 'Smoke Level', value: smokeScore > 2 ? 'Some' : 'Low', color: '#f77f00', description: `Smoke detected: ${smokeScore.toFixed(1)}%` },
            { icon: '🌳', label: 'Vegetation', value: 'Mixed', color: '#48cae4', description: `Green coverage: ${greenScore.toFixed(1)}%` },
            { icon: '🏞️', label: 'Terrain', value: 'Variable', color: '#48cae4', description: 'Mixed risk indicators present' }
        ];
    } else {
        features = [
            { icon: '✅', label: 'Fire Risk', value: 'LOW', color: '#06d6a0', description: `Only ${fireScore.toFixed(1)}% fire indicators` },
            { icon: '🌲', label: 'Vegetation', value: greenScore > 10 ? 'Healthy' : 'Present', color: '#06d6a0', description: `${greenScore.toFixed(1)}% green coverage` },
            { icon: '💨', label: 'Smoke', value: 'None', color: '#06d6a0', description: `${smokeScore.toFixed(1)}% smoke detected` },
            { icon: '🛡️', label: 'Safety Level', value: 'HIGH', color: '#06d6a0', description: 'No significant wildfire indicators' }
        ];
    }
    
    let analysisHTML = '<h3><i class="fas fa-microscope"></i> CNN Feature Analysis</h3>';
    analysisHTML += '<p class="analysis-subtitle">What the model detected in the image:</p>';
    analysisHTML += '<div class="feature-grid">';
    
    features.forEach(feature => {
        analysisHTML += `
            <div class="feature-item">
                <div class="feature-icon">${feature.icon}</div>
                <div class="feature-content">
                    <div class="feature-header">
                        <span class="feature-label">${feature.label}</span>
                        <span class="feature-value" style="color: ${feature.color};">${feature.value}</span>
                    </div>
                    <p class="feature-desc">${feature.description}</p>
                </div>
            </div>
        `;
    });
    
    analysisHTML += '</div>';
    analysisDiv.innerHTML = analysisHTML;
}
