import { build } from './app.js'


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