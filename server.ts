import * as express from "express";
const app = express();

app.use(express.static('public'));

app.listen(process.env.PORT || 80, async () => {
    console.log('started');
});
