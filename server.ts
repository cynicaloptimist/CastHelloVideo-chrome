import * as express from "express";
const app = express();

app.use(express.static('public'));

app.listen(8080, async () => {
    console.log('started');
});
