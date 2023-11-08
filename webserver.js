const http = require('http');
const url = require('url');
const StockfishHandler = require('./stockfish_handler');

const stockfishHandler = new StockfishHandler();
stockfishHandler.init();

const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url, true).query;

  if (queryObject.q) {
    try {
			console.log('start')
      const stockfishResponse = await stockfishHandler.sendCommand(queryObject.q);
			console.log('end')
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(stockfishResponse);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error sending command to Stockfish: ${error.message}`);
    }
  } else {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Please provide a command to send to Stockfish using the "q" query parameter.\n');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
