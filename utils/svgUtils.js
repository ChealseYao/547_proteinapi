function generateStructureSVG(sequence, secondaryStructure) {
    const svgWidth = sequence.length * 10;
    const svgHeight = 50;
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  
    for (let i = 0; i < sequence.length; i++) {
      let color;
      switch (secondaryStructure[i]) {
        case 'H': color = 'red'; break;   
        case 'E': color = 'yellow'; break; 
        default: color = 'gray'; 
      }
      svg += `<rect x="${i * 10}" y="0" width="10" height="30" fill="${color}" />`;
    }
  
    svg += `
      <rect x="10" y="35" width="10" height="10" fill="red" />
      <text x="25" y="45" font-size="10">alpha-helix</text>
      <rect x="70" y="35" width="10" height="10" fill="yellow" />
      <text x="85" y="45" font-size="10">beta-strand</text>
      <rect x="140" y="35" width="10" height="10" fill="gray" />
      <text x="155" y="45" font-size="10">coil</text>
    `;
  
    svg += '</svg>';
    return svg;
  }
  
  module.exports = {
    generateStructureSVG
  };
  