const server = require("./server.js");

const port = 8000; // anything above 3000 is safe
server.listen(port, () => console.log(`\n API on port ${port}`));
