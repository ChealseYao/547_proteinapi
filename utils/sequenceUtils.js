// Splits a protein sequence into fragments of specified size
exports.splitSequenceIntoFragments = function(sequence, fragmentSize) {
    const fragments = [];
    for (let i = 0; i < sequence.length; i += fragmentSize) {
      fragments.push(sequence.substring(i, i + fragmentSize));
    }
    return fragments;
  };
  