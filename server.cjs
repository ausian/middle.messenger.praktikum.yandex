const express = require('express');
const path = require('path'); 

const app = express();
const { PORT = 3000 } = process.env;
app.use(express.static('./dist'));

app.get('/{*any}', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));

    res.status(200);
})

app.listen(PORT, () => { 
    console.log(`Server is running on http://localhost:${PORT}`);
});
