# Test Files for Flashcard Generator

This folder contains various test files to verify the flashcard generation functionality:

## Valid Test Files (.txt format)

### 📚 **biology-vocab.txt**
- **Content**: Comprehensive biology vocabulary covering cell structure, genetics, ecology, and evolution
- **Size**: ~150 terms with definitions
- **Best for**: Testing detailed flashcard generation from structured educational content

### 🧪 **chemistry-basics.txt** 
- **Content**: Chemistry fundamentals including atomic structure, bonding, reactions, and solutions
- **Size**: ~80 terms with definitions
- **Best for**: Testing scientific terminology and concept understanding

### 📐 **math-concepts.txt**
- **Content**: Mathematics covering algebra, geometry, trigonometry, and statistics
- **Size**: ~70 mathematical terms and concepts
- **Best for**: Testing formula and concept-based flashcard generation

### 🏛️ **history-timeline.txt**
- **Content**: World history from ancient civilizations to the 20th century
- **Size**: Major historical events, periods, and figures
- **Best for**: Testing chronological and narrative content processing

### ⚡ **short-text.txt**
- **Content**: Brief explanation of photosynthesis
- **Size**: Single paragraph
- **Best for**: Testing minimum content requirements and simple concept extraction

## File Types for Testing

✅ **Supported**: `.txt` files (all files above)
❌ **Unsupported**: `.md` files (this README will be rejected)

## Usage Instructions

1. **Login/Register** in the flashcard application
2. **Go to "Create New Deck"**
3. **Choose "Upload File"** 
4. **Select any .txt file** from this folder
5. **Give your deck a name** (e.g., "Biology Vocabulary Study")
6. **Upload and wait** for AI processing with Claude
7. **Review generated flashcards** and start studying!

## Expected Results

- **biology-vocab.txt**: Should generate 15-25 flashcards covering cell biology, genetics, ecology, and evolution
- **chemistry-basics.txt**: Should generate 12-20 flashcards on atomic structure, bonding, and reactions  
- **math-concepts.txt**: Should generate 10-18 flashcards on mathematical terms and formulas
- **history-timeline.txt**: Should generate 20-30 flashcards on historical events and figures
- **short-text.txt**: Should generate 2-5 flashcards about photosynthesis

## Troubleshooting

If uploads fail:
1. ✅ Ensure file is `.txt` format
2. ✅ Check file size is under 10MB  
3. ✅ Verify you're logged in
4. ✅ Check browser console for errors
5. ✅ Ensure Claude API key is configured