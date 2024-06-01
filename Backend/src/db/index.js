import pg from "pg";
const { Client } = pg;

const db = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
});

const connectDb = async () => {
    try {
        const connectionInstance = await db.connect();
        console.log("Database coonnected :" + connectionInstance);
    } catch (error) {
        console.log("POSTGRES connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDb;
