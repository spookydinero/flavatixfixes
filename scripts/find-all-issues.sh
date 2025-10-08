#!/bin/bash

# Script to find all issues in the codebase
# This will help us identify and fix all problems in one swoop

echo "🔍 COMPREHENSIVE CODEBASE ISSUE DETECTION"
echo "=========================================="
echo ""

# Issue 1: Slider defaults to 50 instead of 0
echo "📊 Issue 1: Checking for slider defaults of 50..."
echo "Files with slider defaults of 50:"
grep -rn "aroma_intensity: 50\|salt_score: 50\|sweetness_score: 50" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v ".next"
echo ""

# Issue 2: Slider min="1" instead of min="0"
echo "📊 Issue 2: Checking for slider min='1'..."
echo "Files with min='1' or min=\"1\":"
grep -rn 'min="1"\|min='"'"'1'"'"'' --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v ".next"
echo ""

# Issue 3: Using || instead of ?? for number defaults
echo "📊 Issue 3: Checking for || operator with score fields..."
echo "Files using || operator for score defaults (should use ??):"
grep -rn "data\.[a-z_]*score || [0-9]\|data\.[a-z_]*intensity || [0-9]" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v ".next"
echo ""

# Issue 4: tasting_participants queries for quick tasting
echo "📊 Issue 4: Checking for tasting_participants queries..."
echo "Files querying tasting_participants (check if they handle quick mode):"
grep -rn "from('tasting_participants')\|from(\"tasting_participants\")" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v ".next" | head -20
echo ""

# Issue 5: Permission checks without mode validation
echo "📊 Issue 5: Checking for permission checks..."
echo "Files with canAddItems checks (verify they handle quick mode):"
grep -rn "canAddItems\|userPermissions" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v ".next" | head -20
echo ""

# Issue 6: Missing slider visibility (CSS issues)
echo "📊 Issue 6: Checking slider CSS classes..."
echo "Files using slider-ultra-thin class:"
grep -rn "slider-ultra-thin" --include="*.tsx" --include="*.ts" --include="*.css" . | grep -v node_modules | grep -v ".next"
echo ""

# Issue 7: ReviewForm component with wrong defaults
echo "📊 Issue 7: Checking ReviewForm component..."
echo "ReviewForm.tsx default values:"
grep -A 15 "const \[formData, setFormData\] = useState" components/review/ReviewForm.tsx 2>/dev/null || echo "File not found or no match"
echo ""

# Issue 8: Structured review page with wrong defaults
echo "📊 Issue 8: Checking structured review page..."
echo "structured.tsx useState defaults:"
grep -n "useState(50)\|useState(0)" pages/review/structured.tsx 2>/dev/null | head -20 || echo "File not found or no match"
echo ""

# Summary
echo ""
echo "=========================================="
echo "✅ SCAN COMPLETE"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the output above"
echo "2. Fix all instances of:"
echo "   - Slider defaults of 50 → Change to 0"
echo "   - min='1' → Change to min='0'"
echo "   - || operator for scores → Change to ??"
echo "   - tasting_participants queries → Add mode check"
echo "3. Run tests to verify fixes"
echo "4. Commit and deploy"
echo ""

