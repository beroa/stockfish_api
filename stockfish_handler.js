const { spawn } = require("child_process");

class StockfishHandler {
  constructor() {
    this.stockfish = spawn("stockfish");
    this.stockfish.stdout.setEncoding("utf-8");
    this.stockfish.stderr.setEncoding("utf-8");
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      let dataBuffer = "";

      const onData = (data) => {
        dataBuffer += data;
        if (this.isEndOfResponse(dataBuffer, command)) {
          // When the response is complete, remove the listeners and resolve
          this.stockfish.stdout.removeListener("data", onData);
          this.stockfish.stderr.removeListener("data", onError);
          resolve(dataBuffer);
        }
      };

      const onError = (error) => {
        this.stockfish.stdout.removeListener("data", onData);
        this.stockfish.stderr.removeListener("data", onError);
        reject(new Error(`Stockfish Error: ${error}`));
      };

      this.stockfish.stdout.on("data", onData);
      this.stockfish.stderr.on("data", onError);

      // Send the command to Stockfish
      this.stockfish.stdin.write(`${command}\n`);

      if (command.startsWith('position')) {
        resolve('position set')
      } else if (command.startsWith('setoption'))
        resolve('option set')
    });
  }


  isEndOfResponse(buffer, command) {

    if (command.startsWith('go')) {
      return buffer.includes('bestmove');
    } else {
      return buffer.includes('\n')
    }
  }


  init() {
    this.sendCommand("uci");
    this.sendCommand("isready");
    this.sendCommand("ucinewgame");
  }
}

module.exports = StockfishHandler;