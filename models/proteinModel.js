const aminoAcidWeights = {
    A: 89.09, R: 174.2, N: 132.12, D: 133.1, C: 121.16, E: 147.13, Q: 146.15,
    G: 75.07, H: 155.16, I: 131.17, L: 131.17, K: 146.19, M: 149.21, F: 165.19,
    P: 115.13, S: 105.09, T: 119.12, W: 204.23, Y: 181.19, V: 117.15
  };
  
  const gorTable = {
    A: { alpha: 1.42, beta: 0.83, coil: 0.80 },
    R: { alpha: 1.21, beta: 0.84, coil: 0.96 },
    N: { alpha: 0.67, beta: 0.89, coil: 1.34 },
    D: { alpha: 1.01, beta: 0.54, coil: 1.35 },
    C: { alpha: 0.70, beta: 1.19, coil: 1.06 },
    Q: { alpha: 1.11, beta: 1.10, coil: 0.84 },
    E: { alpha: 1.51, beta: 0.37, coil: 1.08 },
    G: { alpha: 0.57, beta: 0.75, coil: 1.56 },
    H: { alpha: 1.00, beta: 0.87, coil: 1.09 },
    I: { alpha: 1.08, beta: 1.60, coil: 0.47 },
    L: { alpha: 1.21, beta: 1.30, coil: 0.59 },
    K: { alpha: 1.16, beta: 0.74, coil: 1.07 },
    M: { alpha: 1.45, beta: 1.05, coil: 0.60 },
    F: { alpha: 1.13, beta: 1.38, coil: 0.59 },
    P: { alpha: 0.57, beta: 0.55, coil: 1.72 },
    S: { alpha: 0.77, beta: 0.75, coil: 1.39 },
    T: { alpha: 0.83, beta: 1.19, coil: 0.96 },
    W: { alpha: 1.08, beta: 1.37, coil: 0.64 },
    Y: { alpha: 0.69, beta: 1.47, coil: 0.87 },
    V: { alpha: 1.06, beta: 1.70, coil: 0.41 }
  };
  
  function calculateMolecularWeight(sequence) {
    return sequence.split('').reduce((weight, aa) => weight + (aminoAcidWeights[aa] || 0), 0);
  }
  
  function gorSecondaryStructure(sequence) {
    const windowSize = 17; 
    const halfWindowSize = Math.floor(windowSize / 2);
    const structure = [];
    const confidenceScores = [];
  
    for (let i = 0; i < sequence.length; i++) {
      let helixScore = 0;
      let sheetScore = 0;
      let coilScore = 0;
  
      for (let j = -halfWindowSize; j <= halfWindowSize; j++) {
        const idx = i + j;
        if (idx >= 0 && idx < sequence.length) { 
          const neighborAa = sequence[idx];
          if (gorTable[neighborAa]) {
            helixScore += gorTable[neighborAa].alpha;
            sheetScore += gorTable[neighborAa].beta;
            coilScore += gorTable[neighborAa].coil;
          }
        }
      }
  
      const maxScore = Math.max(helixScore, sheetScore, coilScore);
      const secondMaxScore = [helixScore, sheetScore, coilScore].sort((a, b) => b - a)[1];
  
      if (maxScore === helixScore) {
        structure.push('H'); 
      } else if (maxScore === sheetScore) {
        structure.push('E'); 
      } else {
        structure.push('C'); 
      }
  
      const confidence = maxScore - secondMaxScore;
      confidenceScores.push(confidence);
    }
  
    return { secondaryStructure: structure.join(''), confidenceScores };
  }
  
  module.exports = {
    calculateMolecularWeight,
    gorSecondaryStructure 
  };
  