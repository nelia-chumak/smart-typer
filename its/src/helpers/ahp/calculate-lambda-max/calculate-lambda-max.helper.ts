import { PairwiseComparisonMatrix } from 'common/types/types.js';
import * as math from 'mathjs';

const calculateLambdaMax = (matrix: PairwiseComparisonMatrix): number => {
  const accuracy = 0.000000001;
  const xStart = Array.from({ length: matrix.length }, () => 1);
  let xPrev = xStart;
  let xCurrent = xStart;
  let prevRatio = 0;
  while (Math.abs(xCurrent[0] / xPrev[0] - prevRatio) > accuracy) {
    prevRatio = xCurrent[0] / xPrev[0];
    xPrev = xCurrent;
    xCurrent = math.multiply(matrix, xPrev);
  }
  const lambdaMax = xCurrent[0] / xPrev[0];
  return lambdaMax;
};

export { calculateLambdaMax };
