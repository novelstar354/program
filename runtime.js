/* =====================================================
   STar Runtime
   runtime.js
   ===================================================== */

class STarRuntime {

    constructor() {

        this.variables = {};
        this.functions = {};

        this.output = [];

    }

    /* ==========================================
       Console
       ========================================== */

    print(value) {

        this.output.push(
            String(value)
        );

        if (
            typeof log === "function"
        ) {

            log(value);

        } else {

            console.log(value);

        }

    }

    /* ==========================================
       Program
       ========================================== */

    run(ast) {

        if (
            ast.type !== "Program"
        ) {

            throw new Error(
                "Program expected"
            );

        }

        for (
            const statement
            of ast.body
        ) {

            this.execute(
                statement
            );

        }

        return this.output;

    }

    /* ==========================================
       Execute
       ========================================== */

    execute(node) {

        switch (
            node.type
        ) {

            case "VariableDeclaration":
                return this.executeVariableDeclaration(node);

            case "PrintStatement":
                return this.executePrint(node);

            case "RepeatStatement":
                return this.executeRepeat(node);

            case "IfStatement":
                return this.executeIf(node);

            case "FunctionDeclaration":
                return this.executeFunctionDeclaration(node);
            case "BinaryExpression":
                return this.evaluateBinary(node);
            case "FunctionCall":
                return this.executeFunctionCall(node);

            default:

                throw new Error(
                    "Unknown node type: " +
                    node.type
                );

        }

    }

    /* ==========================================
       let
       ========================================== */

    executeVariableDeclaration(node) {

        this.variables[
            node.name
        ] =
            this.evaluate(
                node.value
            );

    }

    /* ==========================================
       print
       ========================================== */

    executePrint(node) {

        const value =
            this.evaluate(
                node.value
            );

        this.print(value);

    }

    /* ==========================================
       repeat
       ========================================== */

    executeRepeat(node) {

        const count =
            Number(
                this.evaluate(
                    node.count
                )
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {

            for (
                const statement
                of node.body
            ) {

                this.execute(
                    statement
                );

            }

        }

    }

    /* ==========================================
       if
       ========================================== */

    executeIf(node) {

        const result =
            this.evaluate(
                node.condition
            );

        if (
            result
        ) {

            for (
                const statement
                of node.body
            ) {

                this.execute(
                    statement
                );

            }

        } else {

            for (
                const statement
                of node.elseBody
            ) {

                this.execute(
                    statement
                );

            }

        }

    }

    /* ==========================================
       func
       ========================================== */

    executeFunctionDeclaration(node) {

        this.functions[
            node.name
        ] = node;

    }

    /* ==========================================
       call
       ========================================== */

    executeFunctionCall(node) {

        const fn =
            this.functions[
                node.name
            ];

        if (!fn) {

            throw new Error(
                "Function not found: " +
                node.name
            );

        }

        const previous =
            {
                ...this.variables
            };

        for (
            let i = 0;
            i < fn.params.length;
            i++
        ) {

            this.variables[
                fn.params[i]
            ] =
                this.evaluate(
                    node.arguments[i]
                );

        }

        for (
            const statement
            of fn.body
        ) {

            this.execute(
                statement
            );

        }

        this.variables =
            previous;

    }

    /* ==========================================
       Expressions
       ========================================== */

    evaluate(node) {

        switch (
            node.type
        ) {

            case "StringLiteral":
                return node.value;

            case "NumberLiteral":
                return node.value;

            case "Identifier":

                if (
                    node.name
                    in this.variables
                ) {

                    return this.variables[
                        node.name
                    ];

                }

                throw new Error(
                    "Variable not found: " +
                    node.name
                );

            default:

                throw new Error(
                    "Invalid expression: " +
                    node.type
                );

        }

    }

}

/* =====================================================
   Helper
   ===================================================== */

function runSTarAST(ast) {

    const runtime =
        new STarRuntime();

    return runtime.run(ast);

}

function executeSTar(code) {

    const tokens =
        lexSTar(code);

    const ast =
        parseSTar(tokens);

    return runSTarAST(ast);

}
