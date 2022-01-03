import dotenv from 'dotenv'
import { build } from './app.js'

dotenv.config()

async function start() {
    const app = build({
        logger: {
            level: 'info',
            prettyPrint: true,
        },
    })

    try {
        await app.listen(process.env.PORT)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}
start()