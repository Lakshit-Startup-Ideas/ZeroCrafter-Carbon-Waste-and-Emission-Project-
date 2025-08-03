#!/usr/bin/env python3
"""
ZeroCraftr AI Fine-tuning Script
Fine-tunes the AI model with emission tracking and sustainability data
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime
import os
import requests
from typing import List, Dict, Any

class ZeroCraftrAIFineTuner:
    def __init__(self):
        self.data_dir = "data"
        self.output_dir = "models"
        self.ensure_directories()
        
    def ensure_directories(self):
        """Create necessary directories"""
        for directory in [self.data_dir, self.output_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)
    
    def load_training_data(self) -> Dict[str, Any]:
        """Load all training data"""
        print("Loading training data...")
        
        training_data = {}
        
        # Load emission factors
        try:
            with open(f"{self.data_dir}/emission_factors.json", 'r') as f:
                training_data['emission_factors'] = json.load(f)
            print("✓ Loaded emission factors")
        except FileNotFoundError:
            print("✗ Emission factors file not found")
        
        # Load training Q&A pairs
        try:
            with open(f"{self.data_dir}/training_data.json", 'r') as f:
                training_data['qa_pairs'] = json.load(f)
            print("✓ Loaded Q&A training data")
        except FileNotFoundError:
            print("✗ Training data file not found")
        
        # Load manufacturing emissions data
        try:
            training_data['manufacturing_data'] = pd.read_csv(f"{self.data_dir}/manufacturing_emissions.csv")
            print("✓ Loaded manufacturing emissions data")
        except FileNotFoundError:
            print("✗ Manufacturing emissions file not found")
        
        # Load best practices data
        try:
            training_data['best_practices'] = pd.read_csv(f"{self.data_dir}/sustainability_best_practices.csv")
            print("✓ Loaded best practices data")
        except FileNotFoundError:
            print("✗ Best practices file not found")
        
        return training_data
    
    def generate_training_examples(self, data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate additional training examples from the data"""
        print("Generating training examples...")
        
        examples = []
        
        # Generate examples from emission factors
        if 'emission_factors' in data:
            emission_factors = data['emission_factors']
            
            # Electricity examples
            for fuel, factor in emission_factors['fuels'].items():
                examples.append({
                    "question": f"What is the emission factor for {fuel}?",
                    "answer": f"The emission factor for {fuel} is {factor} kg CO2e per unit. This means that for every unit of {fuel} consumed, {factor} kg of CO2 equivalent emissions are produced."
                })
            
            # Manufacturing process examples
            for process, factor in emission_factors['manufacturing_processes'].items():
                examples.append({
                    "question": f"How do I calculate emissions from {process.replace('_', ' ')}?",
                    "answer": f"To calculate emissions from {process.replace('_', ' ')}, multiply your production output by the emission factor of {factor} kg CO2e per unit. For example, if you produce 1000 units, your emissions would be 1000 × {factor} = {1000 * factor} kg CO2e."
                })
        
        # Generate examples from manufacturing data
        if 'manufacturing_data' in data:
            df = data['manufacturing_data']
            
            # Industry-specific examples
            for industry in df['industry_sector'].unique():
                industry_data = df[df['industry_sector'] == industry]
                avg_emissions = industry_data['total_emissions_kg_co2e'].mean()
                avg_intensity = industry_data['emissions_intensity_kg_co2e_per_employee'].mean()
                
                examples.append({
                    "question": f"What are typical emissions for {industry} manufacturing?",
                    "answer": f"Typical emissions for {industry} manufacturing facilities average {avg_emissions:.0f} kg CO2e annually, with an intensity of {avg_intensity:.1f} kg CO2e per employee. This varies based on facility size, energy sources, and production processes."
                })
        
        # Generate examples from best practices
        if 'best_practices' in data:
            df = data['best_practices']
            
            for _, practice in df.iterrows():
                examples.append({
                    "question": f"What are the benefits of {practice['practice']}?",
                    "answer": f"{practice['practice']} can reduce energy consumption by {practice['energy_savings_percent']}% and emissions by {practice['emission_reduction_kg_co2e_per_year']} kg CO2e annually. The payback period is {practice['payback_years']} years, making it a {practice['implementation_difficulty']} implementation."
                })
        
        print(f"✓ Generated {len(examples)} training examples")
        return examples
    
    def create_fine_tuning_dataset(self, data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Create the final fine-tuning dataset"""
        print("Creating fine-tuning dataset...")
        
        # Load existing Q&A pairs
        qa_pairs = data.get('qa_pairs', {}).get('training_samples', [])
        
        # Generate additional examples
        additional_examples = self.generate_training_examples(data)
        
        # Combine all examples
        all_examples = []
        
        # Add existing Q&A pairs
        for qa in qa_pairs:
            all_examples.append({
                "question": qa['question'],
                "answer": qa['answer']
            })
        
        # Add generated examples
        all_examples.extend(additional_examples)
        
        # Create specialized prompts for emission tracking
        specialized_prompts = self.create_specialized_prompts(data)
        all_examples.extend(specialized_prompts)
        
        print(f"✓ Created fine-tuning dataset with {len(all_examples)} examples")
        return all_examples
    
    def create_specialized_prompts(self, data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Create specialized prompts for emission tracking scenarios"""
        print("Creating specialized prompts...")
        
        prompts = []
        
        # Emission calculation scenarios
        calculation_scenarios = [
            {
                "question": "I use 10,000 kWh of electricity monthly. How much CO2 do I emit?",
                "answer": "With 10,000 kWh monthly electricity consumption, you emit approximately 8,500 kg CO2e per month (10,000 × 0.85 kg CO2e/kWh). This equals 102,000 kg CO2e annually. To reduce emissions, consider energy efficiency measures or renewable energy sources."
            },
            {
                "question": "My facility uses 5,000 liters of diesel fuel monthly. What are my Scope 1 emissions?",
                "answer": "Your Scope 1 emissions from diesel fuel are 13,400 kg CO2e monthly (5,000 × 2.68 kg CO2e/liter). This equals 160,800 kg CO2e annually. Consider fuel-efficient vehicles, route optimization, or electric alternatives to reduce emissions."
            },
            {
                "question": "I produce 1,000 tons of waste annually. How do I calculate waste emissions?",
                "answer": "Waste emissions depend on disposal method. For landfill waste: 1,000 tons × 0.5 kg CO2e/kg = 500,000 kg CO2e. For recycling: 1,000 tons × 0.1 kg CO2e/kg = 100,000 kg CO2e. Recycling reduces emissions by 80% compared to landfill."
            }
        ]
        
        # Sustainability advice scenarios
        advice_scenarios = [
            {
                "question": "How can I reduce my facility's carbon footprint?",
                "answer": "To reduce your facility's carbon footprint:\n\n1. **Energy Efficiency**: Install LED lighting, optimize HVAC, use variable speed drives\n2. **Renewable Energy**: Install solar panels or purchase renewable energy credits\n3. **Waste Reduction**: Implement recycling programs and waste segregation\n4. **Process Optimization**: Review manufacturing processes for efficiency improvements\n5. **Employee Engagement**: Train staff on energy conservation practices\n\nStart with quick wins like LED lighting (50-70% energy savings) and waste segregation (40% waste reduction)."
            },
            {
                "question": "What are the most cost-effective sustainability measures?",
                "answer": "Most cost-effective sustainability measures with payback periods:\n\n**< 1 year**:\n- LED lighting (1.5 years payback)\n- Waste segregation (0.5 years payback)\n- Energy monitoring systems (1 year payback)\n\n**1-3 years**:\n- Variable speed drives (2 years payback)\n- HVAC optimization (2.5 years payback)\n- Compressed air optimization (1-2 years payback)\n\n**3-7 years**:\n- Solar PV installation (7 years payback)\n- Heat recovery systems (3 years payback)\n\nFocus on measures with < 3 year payback for immediate impact."
            }
        ]
        
        # Regulatory compliance scenarios
        compliance_scenarios = [
            {
                "question": "What EPA reporting requirements apply to my manufacturing facility?",
                "answer": "EPA reporting requirements depend on your facility:\n\n**TRI Reporting** (if applicable):\n- Submit annual reports by July 1st\n- Report releases of listed chemicals\n- Maintain records for 3+ years\n\n**GHG Reporting** (if >25,000 metric tons CO2e):\n- Submit annual reports by March 31st\n- Include Scope 1 and some Scope 2 emissions\n- Use EPA-approved calculation methodologies\n\n**State Requirements**:\n- Check your state's specific requirements\n- Some states have lower thresholds than federal\n- California, New York, and Texas have additional programs\n\nConsult with environmental professionals to ensure compliance."
            }
        ]
        
        prompts.extend(calculation_scenarios)
        prompts.extend(advice_scenarios)
        prompts.extend(compliance_scenarios)
        
        print(f"✓ Created {len(prompts)} specialized prompts")
        return prompts
    
    def format_for_groq_fine_tuning(self, examples: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Format examples for Groq API fine-tuning"""
        print("Formatting data for Groq fine-tuning...")
        
        formatted_examples = []
        
        for example in examples:
            formatted_example = {
                "messages": [
                    {
                        "role": "system",
                        "content": "You are ZeroCraftr AI Assistant, a specialized AI for emission tracking and sustainability. You help manufacturers track their carbon footprint, understand emission calculations, and provide sustainability advice. Always provide practical, actionable advice for small manufacturers looking to reduce their environmental impact."
                    },
                    {
                        "role": "user",
                        "content": example["question"]
                    },
                    {
                        "role": "assistant",
                        "content": example["answer"]
                    }
                ]
            }
            formatted_examples.append(formatted_example)
        
        print(f"✓ Formatted {len(formatted_examples)} examples for fine-tuning")
        return formatted_examples
    
    def save_fine_tuning_data(self, examples: List[Dict[str, str]], formatted_examples: List[Dict[str, Any]]):
        """Save fine-tuning data to files"""
        print("Saving fine-tuning data...")
        
        # Save raw examples
        with open(f"{self.output_dir}/fine_tuning_examples.json", 'w') as f:
            json.dump(examples, f, indent=2)
        
        # Save formatted examples for Groq
        with open(f"{self.output_dir}/groq_fine_tuning_data.json", 'w') as f:
            json.dump(formatted_examples, f, indent=2)
        
        # Create training summary
        summary = {
            "created_date": datetime.now().isoformat(),
            "total_examples": len(examples),
            "categories": {
                "emission_calculation": len([e for e in examples if "calculate" in e["question"].lower()]),
                "sustainability_advice": len([e for e in examples if "reduce" in e["question"].lower() or "sustainability" in e["question"].lower()]),
                "regulatory_compliance": len([e for e in examples if "epa" in e["question"].lower() or "compliance" in e["question"].lower()]),
                "best_practices": len([e for e in examples if "practice" in e["question"].lower() or "measure" in e["question"].lower()])
            },
            "data_sources": ["emission_factors", "manufacturing_data", "best_practices", "training_data"],
            "model_target": "ZeroCraftr AI Assistant",
            "fine_tuning_ready": True
        }
        
        with open(f"{self.output_dir}/training_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        print("✓ Fine-tuning data saved successfully!")
        return summary
    
    def create_fine_tuning_instructions(self):
        """Create instructions for fine-tuning with Groq"""
        print("Creating fine-tuning instructions...")
        
        instructions = {
            "model": "llama3-8b-8192",
            "training_data_file": "groq_fine_tuning_data.json",
            "hyperparameters": {
                "learning_rate": 1e-5,
                "batch_size": 4,
                "epochs": 3,
                "warmup_steps": 100,
                "weight_decay": 0.01
            },
            "training_objectives": [
                "Improve emission calculation accuracy",
                "Enhance sustainability advice quality",
                "Provide regulatory compliance guidance",
                "Generate actionable recommendations"
            ],
            "evaluation_metrics": [
                "Response accuracy on emission calculations",
                "Practicality of sustainability advice",
                "Completeness of regulatory guidance",
                "Actionability of recommendations"
            ],
            "deployment_notes": [
                "Update system prompt with ZeroCraftr context",
                "Test on real manufacturing scenarios",
                "Monitor response quality and accuracy",
                "Regular retraining with new data"
            ]
        }
        
        with open(f"{self.output_dir}/fine_tuning_instructions.json", 'w') as f:
            json.dump(instructions, f, indent=2)
        
        print("✓ Fine-tuning instructions created")
        return instructions
    
    def run_fine_tuning_pipeline(self):
        """Run the complete fine-tuning pipeline"""
        print("🚀 Starting ZeroCraftr AI Fine-tuning Pipeline")
        print("=" * 60)
        
        # Load training data
        data = self.load_training_data()
        
        # Create fine-tuning dataset
        examples = self.create_fine_tuning_dataset(data)
        
        # Format for Groq fine-tuning
        formatted_examples = self.format_for_groq_fine_tuning(examples)
        
        # Save fine-tuning data
        summary = self.save_fine_tuning_data(examples, formatted_examples)
        
        # Create fine-tuning instructions
        instructions = self.create_fine_tuning_instructions()
        
        print("\n📊 Fine-tuning Summary:")
        print(f"Total training examples: {summary['total_examples']}")
        print(f"Categories: {summary['categories']}")
        print(f"Data sources: {len(summary['data_sources'])}")
        print(f"Ready for fine-tuning: {summary['fine_tuning_ready']}")
        
        print("\n📁 Output Files:")
        print(f"- {self.output_dir}/fine_tuning_examples.json")
        print(f"- {self.output_dir}/groq_fine_tuning_data.json")
        print(f"- {self.output_dir}/training_summary.json")
        print(f"- {self.output_dir}/fine_tuning_instructions.json")
        
        print("\n✅ Fine-tuning pipeline completed successfully!")
        print("🎯 Next steps:")
        print("1. Review the training data quality")
        print("2. Upload to Groq for fine-tuning")
        print("3. Test the fine-tuned model")
        print("4. Deploy to ZeroCraftr AI Assistant")

def main():
    """Main function to run the fine-tuning pipeline"""
    tuner = ZeroCraftrAIFineTuner()
    tuner.run_fine_tuning_pipeline()

if __name__ == "__main__":
    main() 