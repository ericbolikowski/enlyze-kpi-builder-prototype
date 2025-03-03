declare module "expr-eval" {
  export class Parser {
    constructor();

    parse(expression: string): Expression;
    evaluate(
      expression: string,
      variables?: Record<string, number | string>
    ): number;

    static parse(expression: string): Expression;
    static evaluate(
      expression: string,
      variables?: Record<string, number | string>
    ): number;
  }

  export class Expression {
    evaluate(variables?: Record<string, number | string>): number;
    simplify(variables?: Record<string, number | string>): Expression;
    substitute(variable: string, value: number | Expression): Expression;
    variables(): string[];
    symbols(): string[];
    toString(): string;
  }
}
