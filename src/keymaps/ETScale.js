export default (stepsPerOctave, refPitch) => (stepsOverRefPitch) => {
  const stepFactor = Math.pow(2, 1 / stepsPerOctave);
  return refPitch * Math.pow(stepFactor, stepsOverRefPitch);
};
