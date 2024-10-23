function buildQuery(params) {
    const query = {};
    if (params.name) {
        query.name = { $regex: params.name, $options: 'i' };  // Case-insensitive partial matches
    }
    if (params.minMolecularWeight && params.maxMolecularWeight) {
        query.molecularWeight = { $gte: Number(params.minMolecularWeight), $lte: Number(params.maxMolecularWeight) };
    }
    if (params.sequenceLength) {
        query.sequenceLength = Number(params.sequenceLength);
    }
    return query;
}

module.exports = { buildQuery };
