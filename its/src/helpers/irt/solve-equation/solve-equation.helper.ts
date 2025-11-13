import * as math from 'mathjs';

const solveEquation = (
  equation: string,
  equationDerivative: string,
): number | undefined => {
  const f = (x: number): number => math.evaluate(equation, { x }) as number;

  const derivativeNode = math.derivative(equationDerivative, 'x');
  const fp = (x: number): number => derivativeNode.evaluate({ x }) as number;

  let currentValue = 0;
  let nextValue: number;
  let functionValue: number;
  let functionDerivative: number;

  const tolerance = 1e-7;
  const minDerivative = 1e-12;

  for (let i = 0; i < 20; i++) {
    functionValue = f(currentValue);
    functionDerivative = fp(currentValue);

    if (
      !Number.isFinite(functionValue) ||
      !Number.isFinite(functionDerivative)
    ) {
      return undefined;
    }

    if (Math.abs(functionDerivative) < minDerivative) {
      return undefined;
    }

    nextValue = currentValue - functionValue / functionDerivative;

    if (Math.abs(nextValue - currentValue) <= tolerance * Math.abs(nextValue)) {
      return nextValue;
    }

    currentValue = nextValue;
  }

  return undefined;
};

export { solveEquation };
