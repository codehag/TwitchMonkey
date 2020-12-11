function twitch(string) {
  const tokens = lex(string);
  const bytecode = parse(tokens);
  return interpret(bytecode);
}

function lex(string) {
  return string
    .split(/\s/g)
    .filter(x => !!x)
    .map(string => {
      if (string.match(/a|b|c|d|fun|end|run/g)) {
        return string.toUpperCase()
      } else {
        return string;
      }
    });
}

// This language has no structure, so we are jumping straight to bytecode rather than first building
// an AST
function parse(tokens) {
  const bytecode = [];
  while (tokens) {
    token = tokens.shift();
    if (!token) {
      break;
    }
    emitStatement(tokens, bytecode);
  }
  return bytecode;
}

function emitStatement(tokens, bytecode) {
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
    case "FUN": {
      emitFunction(tokens, bytecode);
      break;
    }
    case "END": {
      throw new Error("invalid end");
    }
    case undefined: {
      throw new Error("invalid whatever");
      break;
    }
    case "RUN": {
      bytecode.push("RUN");
      let name = tokens.shift();
      if (isNamingError(name)) {
        throw new Error("invalid name");
      }
      bytecode.push(name);
      break;
    }
    default: {
      throw new Error(`invalid stuff "${token}"`);
    }
  }
}

function emitFunction(tokens, bytecode) {
  bytecode.push("FUN");
  let name = tokens.shift();
  if (isNamingError(name)) {
    throw new Error("invalid name");
  }
  bytecode.push(name);
  let endTarget = bytecode.length;
  bytecode.push(endTarget);
  while (tokens) {
    token = tokens.shift();
    if (!token) {
      throw new Error("function incomplete");
    }
    switch (token) {
      case "END": {
        bytecode[endTarget] = bytecode.length - 1;
        return;
      }
      default: {
        emitStatement(tokens, bytecode);
        break;
      }
    }
  }
}

function isNamingError(token) {
  return !token || ["A", "B", "C", "D", "FUN", "END"].includes(token);
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

  let functions = {};
  for (let index=0; index < bytecode.length; index++) {
    let code = bytecode[index];
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
      case "FUN": {
        let name = bytecode[index + 1];
        let end = bytecode[index + 2];
        let start = index + 3;
        functions[name] = {start, end};
        // step forward to get the name.
        index = end;
        break;
      }
      case "RUN": {
        // step forward to get the name.
        index += 1
        let name = bytecode[index];
        evaluateFunction(functions[name], bytecode);
        break;
      }
      case undefined: {
        throw Error("wat")
      }
      default: {
        break;
      }
    }
  }
}

function evaluateFunction(func, bytecode) {
  const functionBytecode = bytecode.slice(func.start, func.end + 1);
  interpret(functionBytecode);
}

function createScript(bytecode) {
  return {
    counter: 0,
    compiledScript: null,
    bytecode
  }
}

function name(bytecode) {
  return bytecode.join("");
}

const compiler = {
  enabled: true,
  scripts: {},
  threshold: 10,

  incrementScriptCounter(bytecode) {
    if (!this.scripts[name(bytecode)]) {
      this.scripts[name(bytecode)] = createScript(bytecode);
    }
    return this.scripts[name(bytecode)].counter++;
  },

  hasCompiledScript(bytecode) {
    return !!this.scripts[name(bytecode)].compiledScript;
  },

  runCompiledCode(bytecode) {
    console.log("JIT Script ⚡");
    return this.scripts[name(bytecode)].compiledScript();
  },

  compileCode(bytecode) {
    let output = "";
    let functions = {};
    for (let index = 0; index <= bytecode.length; index++) {
      let code = bytecode[index];
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
        case "FUN": {
          let name = bytecode[index + 1];
          let end = bytecode[index + 2];
          let start = index + 3;
          functions[name] = {start, end};
          // step forward to skip around function.
          index = end;
          break;
        }
        case "RUN": {
          // step forward to get the name.
          index += 1
          let name = bytecode[index];
          evaluateFunction(functions[name], bytecode);
          break;
        }
        default: {
          break;
        }
      }
    }
    this.scripts[name(bytecode)].compiledScript = new Function("", output);
  }
}

const instruction = {
  a: "duck",
  b: "goose",
  c: "swan",
  d: "finch"
}

