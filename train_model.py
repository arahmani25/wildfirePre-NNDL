"""
WildfireGuard AI - CNN Model Training Script
Deep Learning model for wildfire risk prediction from satellite imagery
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import json

# TensorFlow and Keras imports
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Configuration
class Config:
    # Dataset paths
    BASE_DIR = r"d:\Shah\wildfire"
    TRAIN_DIR = os.path.join(BASE_DIR, "train")
    VALID_DIR = os.path.join(BASE_DIR, "valid")
    TEST_DIR = os.path.join(BASE_DIR, "test")
    
    # Model parameters
    IMG_HEIGHT = 350
    IMG_WIDTH = 350
    IMG_CHANNELS = 3
    BATCH_SIZE = 32
    EPOCHS = 50
    LEARNING_RATE = 0.001
    
    # Output paths
    MODEL_SAVE_PATH = os.path.join(BASE_DIR, "models")
    PLOTS_SAVE_PATH = os.path.join(BASE_DIR, "plots")
    LOGS_DIR = os.path.join(BASE_DIR, "logs")
    
    # Class names
    CLASSES = ['nowildfire', 'wildfire']
    NUM_CLASSES = 2

# Create output directories
os.makedirs(Config.MODEL_SAVE_PATH, exist_ok=True)
os.makedirs(Config.PLOTS_SAVE_PATH, exist_ok=True)
os.makedirs(Config.LOGS_DIR, exist_ok=True)

print("="*70)
print("🔥 WildfireGuard AI - Model Training")
print("="*70)
print(f"TensorFlow version: {tf.__version__}")
print(f"GPU Available: {tf.config.list_physical_devices('GPU')}")
print(f"Training on: {Config.TRAIN_DIR}")
print(f"Image size: {Config.IMG_HEIGHT}x{Config.IMG_WIDTH}x{Config.IMG_CHANNELS}")
print("="*70)


def create_data_generators():
    """
    Create image data generators with augmentation
    Augmentation helps prevent overfitting and improves generalization
    """
    print("\n📊 Creating data generators...")
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        zoom_range=0.2,
        shear_range=0.15,
        fill_mode='nearest'
    )
    
    # Validation and test data (only rescaling, no augmentation)
    val_test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Training generator
    train_generator = train_datagen.flow_from_directory(
        Config.TRAIN_DIR,
        target_size=(Config.IMG_HEIGHT, Config.IMG_WIDTH),
        batch_size=Config.BATCH_SIZE,
        class_mode='binary',  # Binary classification
        shuffle=True,
        seed=42
    )
    
    # Validation generator
    validation_generator = val_test_datagen.flow_from_directory(
        Config.VALID_DIR,
        target_size=(Config.IMG_HEIGHT, Config.IMG_WIDTH),
        batch_size=Config.BATCH_SIZE,
        class_mode='binary',
        shuffle=False
    )
    
    # Test generator
    test_generator = val_test_datagen.flow_from_directory(
        Config.TEST_DIR,
        target_size=(Config.IMG_HEIGHT, Config.IMG_WIDTH),
        batch_size=Config.BATCH_SIZE,
        class_mode='binary',
        shuffle=False
    )
    
    print(f"✅ Training samples: {train_generator.samples}")
    print(f"✅ Validation samples: {validation_generator.samples}")
    print(f"✅ Test samples: {test_generator.samples}")
    print(f"✅ Class indices: {train_generator.class_indices}")
    
    return train_generator, validation_generator, test_generator


def build_cnn_model():
    """
    Build CNN model architecture
    Architecture: Conv2D -> MaxPooling -> Conv2D -> MaxPooling -> Dense -> Output
    """
    print("\n🏗️ Building CNN model...")
    
    model = models.Sequential([
        # Input layer
        layers.Input(shape=(Config.IMG_HEIGHT, Config.IMG_WIDTH, Config.IMG_CHANNELS)),
        
        # Convolutional Block 1
        layers.Conv2D(32, (3, 3), activation='relu', padding='same', name='conv1'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2), name='pool1'),
        
        # Convolutional Block 2
        layers.Conv2D(64, (3, 3), activation='relu', padding='same', name='conv2'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2), name='pool2'),
        
        # Convolutional Block 3
        layers.Conv2D(128, (3, 3), activation='relu', padding='same', name='conv3'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2), name='pool3'),
        
        # Convolutional Block 4
        layers.Conv2D(256, (3, 3), activation='relu', padding='same', name='conv4'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2), name='pool4'),
        
        # Flatten and Dense layers (MLP)
        layers.Flatten(name='flatten'),
        layers.Dense(512, activation='relu', name='dense1'),
        layers.Dropout(0.5, name='dropout1'),
        layers.Dense(256, activation='relu', name='dense2'),
        layers.Dropout(0.5, name='dropout2'),
        
        # Output layer (sigmoid for binary classification)
        layers.Dense(1, activation='sigmoid', name='output')
    ])
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=Config.LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=['accuracy', 
                 tf.keras.metrics.Precision(name='precision'),
                 tf.keras.metrics.Recall(name='recall'),
                 tf.keras.metrics.AUC(name='auc')]
    )
    
    print("\n📋 Model Architecture:")
    model.summary()
    
    return model


def create_callbacks():
    """
    Create training callbacks for model optimization
    """
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    
    callbacks = [
        # Save best model
        ModelCheckpoint(
            filepath=os.path.join(Config.MODEL_SAVE_PATH, 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        
        # Early stopping to prevent overfitting
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate when plateauing
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        
        # TensorBoard logging
        TensorBoard(
            log_dir=os.path.join(Config.LOGS_DIR, f'run_{timestamp}'),
            histogram_freq=1
        )
    ]
    
    return callbacks


def plot_training_history(history):
    """
    Plot training history (accuracy and loss)
    """
    print("\n📈 Generating training plots...")
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Accuracy plot
    axes[0, 0].plot(history.history['accuracy'], label='Train Accuracy', linewidth=2)
    axes[0, 0].plot(history.history['val_accuracy'], label='Val Accuracy', linewidth=2)
    axes[0, 0].set_title('Model Accuracy', fontsize=14, fontweight='bold')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    
    # Loss plot
    axes[0, 1].plot(history.history['loss'], label='Train Loss', linewidth=2)
    axes[0, 1].plot(history.history['val_loss'], label='Val Loss', linewidth=2)
    axes[0, 1].set_title('Model Loss', fontsize=14, fontweight='bold')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True, alpha=0.3)
    
    # Precision plot
    axes[1, 0].plot(history.history['precision'], label='Train Precision', linewidth=2)
    axes[1, 0].plot(history.history['val_precision'], label='Val Precision', linewidth=2)
    axes[1, 0].set_title('Model Precision', fontsize=14, fontweight='bold')
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Precision')
    axes[1, 0].legend()
    axes[1, 0].grid(True, alpha=0.3)
    
    # Recall plot
    axes[1, 1].plot(history.history['recall'], label='Train Recall', linewidth=2)
    axes[1, 1].plot(history.history['val_recall'], label='Val Recall', linewidth=2)
    axes[1, 1].set_title('Model Recall', fontsize=14, fontweight='bold')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Recall')
    axes[1, 1].legend()
    axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(Config.PLOTS_SAVE_PATH, 'training_history.png'), dpi=300, bbox_inches='tight')
    print(f"✅ Saved: training_history.png")
    plt.close()


def evaluate_model(model, test_generator):
    """
    Evaluate model on test set and generate metrics
    """
    print("\n🎯 Evaluating model on test set...")
    
    # Get predictions
    predictions = model.predict(test_generator, verbose=1)
    predicted_classes = (predictions > 0.5).astype(int).flatten()
    true_classes = test_generator.classes
    
    # Classification report
    print("\n📊 Classification Report:")
    print(classification_report(true_classes, predicted_classes, 
                                target_names=Config.CLASSES, digits=4))
    
    # Confusion matrix
    cm = confusion_matrix(true_classes, predicted_classes)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=Config.CLASSES, 
                yticklabels=Config.CLASSES,
                cbar_kws={'label': 'Count'})
    plt.title('Confusion Matrix', fontsize=16, fontweight='bold', pad=20)
    plt.ylabel('True Label', fontsize=12)
    plt.xlabel('Predicted Label', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(Config.PLOTS_SAVE_PATH, 'confusion_matrix.png'), dpi=300, bbox_inches='tight')
    print(f"✅ Saved: confusion_matrix.png")
    plt.close()
    
    # ROC Curve
    fpr, tpr, thresholds = roc_curve(true_classes, predictions)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(10, 8))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random Classifier')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('Receiver Operating Characteristic (ROC) Curve', fontsize=16, fontweight='bold', pad=20)
    plt.legend(loc="lower right", fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(Config.PLOTS_SAVE_PATH, 'roc_curve.png'), dpi=300, bbox_inches='tight')
    print(f"✅ Saved: roc_curve.png")
    plt.close()
    
    # Calculate metrics
    test_loss, test_accuracy, test_precision, test_recall, test_auc = model.evaluate(test_generator, verbose=0)
    
    metrics = {
        'test_loss': float(test_loss),
        'test_accuracy': float(test_accuracy),
        'test_precision': float(test_precision),
        'test_recall': float(test_recall),
        'test_auc': float(test_auc),
        'roc_auc': float(roc_auc)
    }
    
    # Save metrics to JSON
    with open(os.path.join(Config.MODEL_SAVE_PATH, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=4)
    
    print("\n📊 Test Metrics:")
    for key, value in metrics.items():
        print(f"   {key}: {value:.4f}")
    
    return metrics


def main():
    """
    Main training pipeline
    """
    print("\n" + "="*70)
    print("🚀 Starting training pipeline...")
    print("="*70)
    
    # Create data generators
    train_gen, val_gen, test_gen = create_data_generators()
    
    # Build model
    model = build_cnn_model()
    
    # Create callbacks
    callbacks = create_callbacks()
    
    # Calculate steps per epoch
    steps_per_epoch = train_gen.samples // Config.BATCH_SIZE
    validation_steps = val_gen.samples // Config.BATCH_SIZE
    
    # Train model
    print("\n🔥 Training model...")
    print(f"Epochs: {Config.EPOCHS}")
    print(f"Batch size: {Config.BATCH_SIZE}")
    print(f"Steps per epoch: {steps_per_epoch}")
    print(f"Validation steps: {validation_steps}")
    print("="*70)
    
    history = model.fit(
        train_gen,
        steps_per_epoch=steps_per_epoch,
        epochs=Config.EPOCHS,
        validation_data=val_gen,
        validation_steps=validation_steps,
        callbacks=callbacks,
        verbose=1
    )
    
    # Plot training history
    plot_training_history(history)
    
    # Evaluate on test set
    metrics = evaluate_model(model, test_gen)
    
    # Save final model
    final_model_path = os.path.join(Config.MODEL_SAVE_PATH, 'wildfire_model_final.h5')
    model.save(final_model_path)
    print(f"\n✅ Final model saved: {final_model_path}")
    
    # Save model as TensorFlow SavedModel format (for deployment)
    saved_model_path = os.path.join(Config.MODEL_SAVE_PATH, 'saved_model')
    model.save(saved_model_path, save_format='tf')
    print(f"✅ SavedModel format saved: {saved_model_path}")
    
    # Convert to TensorFlow Lite (for mobile/edge deployment)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    tflite_path = os.path.join(Config.MODEL_SAVE_PATH, 'wildfire_model.tflite')
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    print(f"✅ TFLite model saved: {tflite_path}")
    
    print("\n" + "="*70)
    print("🎉 Training completed successfully!")
    print(f"📊 Final Test Accuracy: {metrics['test_accuracy']*100:.2f}%")
    print(f"📊 Final Test AUC: {metrics['test_auc']:.4f}")
    print("="*70)


if __name__ == "__main__":
    main()
