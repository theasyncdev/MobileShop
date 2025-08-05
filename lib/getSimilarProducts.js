    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

    export function getSimilarProducts(currentProduct, allProducts, maxResults = 5, options = {}) {
        if (!currentProduct || !Array.isArray(allProducts)) return [];

        const {
            weightBrand = 40,
            weightPrice = 30,
            weightName = 20,
            weightDescription = 10,
            priceThreshold = 0.25,
            enableDescriptionAnalysis = true
        } = options;

        const scores = allProducts
            .filter(p => p._id !== currentProduct._id)
            .map(product => {
                let score = 0;

                if (product.brand && currentProduct.brand) {
                    const currentBrand = currentProduct.brand.toLowerCase();
                    const productBrand = product.brand.toLowerCase();

                    if (currentBrand === productBrand) {
                        score += weightBrand;
                    } else if (currentBrand.includes(productBrand) || productBrand.includes(currentBrand)) {
                        score += weightBrand * 0.7;
                    }
                }

                if (typeof product.price === 'number' && typeof currentProduct.price === 'number') {
                    const priceDiff = Math.abs(product.price - currentProduct.price);
                    const priceThresholdValue = currentProduct.price * priceThreshold;
                    if (priceDiff <= priceThresholdValue) {
                        const priceSimilarity = 1 - (priceDiff / priceThresholdValue);
                        score += weightPrice * priceSimilarity;
                    }
                }

                if (product.name && currentProduct.name) {
                    const currentWords = currentProduct.name.toLowerCase().split(/\s+/);
                    const productWords = product.name.toLowerCase().split(/\s+/);

                    const exactMatches = currentWords.filter(word =>
                        productWords.includes(word)
                    );
                    score += exactMatches.length * (weightName * 0.6);

                    const partialMatches = currentWords.filter(word =>
                        productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
                    );
                    score += (partialMatches.length - exactMatches.length) * (weightName * 0.3);

                    const currentName = currentProduct.name.toLowerCase();
                    const productName = product.name.toLowerCase();
                    const maxLength = Math.max(currentName.length, productName.length);
                    const editDistance = levenshteinDistance(currentName, productName);
                    const similarity = 1 - (editDistance / maxLength);
                    score += similarity * (weightName * 0.1);
                }

                if (enableDescriptionAnalysis && product.description && currentProduct.description) {
                    const descriptionSimilarity = calculateCosineSimilarity(
                        currentProduct.description,
                        product.description
                    );
                    score += descriptionSimilarity * weightDescription;
                }

                return { product, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map(item => item.product);

        return scores;
    }

    function levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    function calculateCosineSimilarity(text1, text2) {
        const tokenize = text => {
            const cleaned = text.toLowerCase().replace(/[^\w\s]/g, '');
            const words = cleaned.split(/\s+/);
            const freq = {};
            for (const word of words) {
                if (word && !stopWords.includes(word)) {
                    freq[word] = (freq[word] || 0) + 1;
                }
            }
            return freq;
        };

        const freq1 = tokenize(text1);
        const freq2 = tokenize(text2);
        const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);

        let dotProduct = 0, mag1 = 0, mag2 = 0;
        for (const word of allWords) {
            const val1 = freq1[word] || 0;
            const val2 = freq2[word] || 0;
            dotProduct += val1 * val2;
            mag1 += val1 * val1;
            mag2 += val2 * val2;
        }

        return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2) || 1);
    }
