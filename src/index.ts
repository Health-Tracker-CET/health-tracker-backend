import express from 'express';
import Router from './Routes/Routes';

const app = express();
const PORT = 3000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.get('/', (req : express.Request, res : express.Response) => {
    res.status(200).send("<h1>Hello World</h1>");
})

app.use('/api', Router)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});