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
      }
    });
  }


  isEndOfResponse(buffer, command) {

    if (command.startsWith('go')) {
      return buffer.includes('bestmove');
    } else {
      return buffer.includes('\n')
    }

    // Implement logic to determine if the end of the response has been reached
    // This will vary depending on the command sent and the expected response
    // For example:
    // if (command.startsWith('go')) {
    //   return buffer.includes('bestmove');
    // }
    // Add other conditions as necessary based on the commands you are sending
  }


  init() {
    this.sendCommand("uci");
    this.sendCommand("isready");
    this.sendCommand("ucinewgame");
  }
}

module.exports = StockfishHandler;

// const { spawn } = require('child_process');

// class StockfishHandler {
//   constructor() {
//     this.stockfish = spawn('stockfish');
//     this.buffer = '';
//     this.setupEventHandlers();
//   }

//   setupEventHandlers() {
//     this.stockfish.stdout.on('data', (data) => {
//       this.buffer += data.toString();
//       // Trigger events or resolve promises here when complete lines are received.

//       console.log('this.buffer', this.buffer)
//       // console.log(`Stockfish response: ${data}`)
//     });

//     this.stockfish.stderr.on('data', (data) => {
//       console.error(`Error: ${data}`);
//     });

//     this.stockfish.on('close', (code) => {
//       console.log(`Stockfish process exited with code ${code}`);
//     });
//   }

//   sendCommand(command) {
//     console.log(`Sending command to Stockfish: ${command}`);
//     this.stockfish.stdin.write(`${command}\n`);
//     return new Promise((resolve) => {
//       const listener = (data) => {
//         console.log('data here', data)
//         if (data.toString().includes('ponder')) {
//           // Remove the listener once we have a complete line
//           this.stockfish.stdout.removeListener('data', listener);
//           console.log('resolving with', this.buffer)
//           resolve(this.buffer);
//           this.buffer = ''; // Clear the buffer after resolving
//         }
//       };
//       this.stockfish.stdout.on('data', listener);
//     });
//   }

//   init() {
//     this.sendCommand('uci');
//     this.sendCommand('isready');
//     this.sendCommand('ucinewgame');
//   }
// }

// module.exports = StockfishHandler;
