function lex(string) {
  return string
    .match(/a|b|c|d/g)
    .map(token => token.toUpperCase());
}

// This language has no structure, so we are jumping straight to bytecode rather than first building
// an AST
function parse(tokens) {
  const bytecode = [];
  for (let token of tokens) {
    switch (token) {
      case "A": {
        bytecode.push("xA");
        break;
      }
      case "B": {
        bytecode.push("xB");
        break;
      }
      case "C": {
        bytecode.push("xC");
        break;
      }
      case "D": {
        bytecode.push("xD");
        break;
      }
      default: {
        throw new Error("invalid stuff");
      }
    }
  }
  return bytecode;
}

function interpret(bytecode) {
  if (compiler.enabled) {
    const count = compiler.incrementScriptCounter(bytecode);

    if (count > compiler.threshold) {
      if (compiler.hasCompiledScript(bytecode)) {
        return compiler.runCompiledCode(bytecode);
      } else {
        console.log("warm up: 💡");
        compiler.compileCode(bytecode);
      }
    }
  }

  for (let code of bytecode) {
    switch (code) {
      case "xA": {
        console.log(instruction.a);
        break;
      }
      case "xB": {
        console.log(instruction.b);
        break;
      }
      case "xC": {
        console.log(instruction.c);
        break;
      }
      case "xD": {
        console.log(instruction.d);
        break;
      }
    }
  }
}

function createScript(bytecode) {
  return {
    counter: 0,
    compiledScript: null,
    bytecode
  }
}

const compiler = {
  enabled: true,
  scripts: new Map(),
  threshold: 10,

  incrementScriptCounter(bytecode) {
    if (!this.scripts[bytecode]) {
      this.scripts[bytecode] = createScript(bytecode);
    }
    return this.scripts[bytecode].counter++;
  },

  hasCompiledScript(bytecode) {
    return !!this.scripts[bytecode].compiledScript;
  },

  runCompiledCode(bytecode) {
    console.log("JIT Script ⚡");
    return this.scripts[bytecode].compiledScript();
  },

  compileCode(bytecode) {
    let output = "";
    for (const code of bytecode) {
      switch (code) {
        case "xA": {
          output += `console.log("${instruction.a}");`;
          break;
        }
        case "xB": {
          output += `console.log("${instruction.b}");`;
          break;
        }
        case "xC": {
          output += `console.log("${instruction.c}");`;
          break;
        }
        case "xD": {
          output += `console.log("${instruction.d}");`;
          break;
        }
      }
    }
    this.scripts[bytecode].compiledScript = new Function("", output);
  }
}

const instruction = {
  a: "duck",
  b: "goose",
  c: "swan",
  d: "finch"
}

