# AI Dataset One-Hot Encoder using Decoder Logic

## Project Description

This project provides a dynamic CSV-based one-hot encoding system using decoder logic.

The system is not restricted to predefined categories.

The user can upload any CSV file containing categorical data.

The system automatically:

1. Reads the CSV file
2. Detects all columns
3. Identifies categorical columns
4. Finds all unique categorical values
5. Generates binary codes
6. Generates one-hot vectors
7. Displays the encoded dataset
8. Provides a downloadable encoded CSV file

---

## Working Flow

```text
Upload CSV
    ↓
Read Complete Dataset
    ↓
Detect Column Types
    ↓
Find Unique Categorical Values
    ↓
Generate Binary Codes
    ↓
Decoder Logic
    ↓
Generate One-Hot Vectors
    ↓
Display Encoded Dataset
    ↓
Download Result