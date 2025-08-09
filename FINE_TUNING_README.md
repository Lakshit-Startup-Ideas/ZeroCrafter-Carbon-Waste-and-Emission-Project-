# ZeroCraftr AI Fine-tuning Guide

This guide explains how to fine-tune the ZeroCraftr AI Assistant with comprehensive emission tracking and sustainability data.

## 🎯 Overview

The ZeroCraftr AI Assistant is fine-tuned to provide expert guidance on:

- **Emission Calculations**: Accurate Scope 1, 2, and 3 calculations
- **Sustainability Advice**: Practical recommendations for emission reduction
- **Regulatory Compliance**: EPA and state-specific requirements
- **Best Practices**: Industry-specific sustainability measures

## 📊 Data Sources

### 1. Emission Factors Dataset

- **Source**: IPCC 2021, EPA eGRID 2021, IEA 2023
- **Content**: Comprehensive emission factors for all energy sources
- **File**: `data/emission_factors.json`

### 2. Manufacturing Emissions Dataset

- **Source**: EPA TRI 2022, Industry Reports
- **Content**: Real manufacturing facility emission data
- **File**: `data/manufacturing_emissions_sample.csv`

### 3. Training Q&A Dataset

- **Source**: Expert-curated emission tracking scenarios
- **Content**: 1500+ question-answer pairs
- **File**: `data/training_data.json`

### 4. Sustainability Best Practices

- **Source**: Industry reports, academic papers
- **Content**: Actionable sustainability measures
- **File**: `data/sustainability_best_practices.csv`

## 🚀 Fine-tuning Process

### Step 1: Data Preparation

```bash
# Install Python dependencies
cd scripts
pip install -r requirements.txt

# Download and process data
python download_data.py
```

### Step 2: Generate Training Data

```bash
# Create fine-tuning dataset
python fine_tune_ai.py
```

### Step 3: Fine-tune with Groq

```python
import groq
from groq import Groq

# Initialize Groq client
client = Groq(api_key="your-groq-api-key")

# Upload training data
with open("models/groq_fine_tuning_data.json", "r") as f:
    training_data = json.load(f)

# Create fine-tuning job
response = client.fine_tuning.create(
    model="llama3-8b-8192",  # Or your fine-tuned model name
    training_data=training_data,
    hyperparameters={
        "learning_rate": 1e-5,
        "batch_size": 4,
        "epochs": 3
    }
)
```

### Step 4: Deploy Fine-tuned Model

```js
// Update backend AI routes with fine-tuned model
// In backend/routes/ai.js, update the model name and use Groq endpoint:
model: 'your-fine-tuned-model-name';
// Endpoint: https://api.groq.com/openai/v1/chat/completions
```

## 📈 Training Data Categories

### 1. Emission Calculations (40% of data)

- Scope 1, 2, 3 emission calculations
- Emission factor applications
- Real-world calculation examples

### 2. Sustainability Advice (30% of data)

- Energy efficiency measures
- Waste reduction strategies
- Renewable energy implementation

### 3. Regulatory Compliance (20% of data)

- EPA reporting requirements
- State-specific regulations
- Compliance best practices

### 4. Best Practices (10% of data)

- Industry-specific recommendations
- Cost-benefit analysis
- Implementation guidance

## 🎯 Expected Improvements

### Before Fine-tuning

- Generic sustainability advice
- Limited emission calculation accuracy
- Basic regulatory knowledge

### After Fine-tuning

- **Accurate Calculations**: ±5% emission calculation accuracy
- **Industry-Specific Advice**: Tailored recommendations by sector
- **Regulatory Expertise**: Up-to-date compliance guidance
- **Practical Solutions**: Actionable, cost-effective measures

## 📊 Evaluation Metrics

### 1. Calculation Accuracy

- Test on 100+ real manufacturing scenarios
- Compare calculated vs. actual emissions
- Target: >95% accuracy

### 2. Advice Quality

- Expert review of sustainability recommendations
- Practicality assessment
- Cost-benefit analysis accuracy

### 3. Regulatory Compliance

- Accuracy of EPA requirement guidance
- State-specific regulation knowledge
- Compliance deadline accuracy

### 4. User Satisfaction

- Response relevance scoring
- Actionability assessment
- User feedback analysis

## 🔄 Continuous Improvement

### Monthly Updates

- New emission factors
- Updated regulatory requirements
- Industry best practices

### Quarterly Retraining

- Incorporate new training data
- Update model with latest information
- Performance optimization

### Annual Major Update

- Comprehensive data refresh
- Model architecture improvements
- New feature integration

## 🛠️ Technical Implementation

### Model Architecture

- **Base Model**: Llama3-8b-8192
- **Fine-tuning Method**: LoRA (Low-Rank Adaptation)
- **Training Data**: 1500+ specialized examples
- **Context Length**: 8192 tokens

### Training Parameters

```json
{
  "learning_rate": 1e-5,
  "batch_size": 4,
  "epochs": 3,
  "warmup_steps": 100,
  "weight_decay": 0.01,
  "gradient_accumulation_steps": 4
}
```

### Deployment Strategy

1. **A/B Testing**: Compare fine-tuned vs. base model
2. **Gradual Rollout**: Deploy to 10% of users first
3. **Monitoring**: Track performance metrics
4. **Full Deployment**: Roll out to all users

## 📁 File Structure

```
ZeroCraftr/
├── data/
│   ├── emission_factors.json
│   ├── training_data.json
│   ├── manufacturing_emissions_sample.csv
│   └── sustainability_best_practices.csv
├── models/
│   ├── fine_tuning_examples.json
│   ├── groq_fine_tuning_data.json
│   ├── training_summary.json
│   └── fine_tuning_instructions.json
├── scripts/
│   ├── download_data.py
│   ├── fine_tune_ai.py
│   └── requirements.txt
└── FINE_TUNING_README.md
```

## 🎯 Success Criteria

### Technical Metrics

- [ ] 95%+ emission calculation accuracy
- [ ] <2 second response time
- [ ] 99%+ uptime
- [ ] Zero data leaks

### Business Metrics

- [ ] 50%+ improvement in user satisfaction
- [ ] 30%+ increase in actionable advice quality
- [ ] 25%+ reduction in support tickets
- [ ] 40%+ improvement in compliance accuracy

### User Experience

- [ ] More accurate emission calculations
- [ ] Practical sustainability recommendations
- [ ] Up-to-date regulatory guidance
- [ ] Industry-specific advice

## 🚀 Next Steps

1. **Run Data Download Script**: `python scripts/download_data.py`
2. **Generate Training Data**: `python scripts/fine_tune_ai.py`
3. **Review Training Data**: Check quality and completeness
4. **Start Fine-tuning**: Upload to Groq platform
5. **Test Fine-tuned Model**: Validate performance
6. **Deploy to Production**: Update ZeroCraftr AI Assistant

## 📞 Support

For questions about the fine-tuning process:

- Check the training data quality
- Review the fine-tuning instructions
- Test with sample scenarios
- Monitor performance metrics

---

**Built by Lakshit Mathur for ZeroCraftr** 🚀
