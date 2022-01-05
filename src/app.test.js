import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

import { build } from './app.js'

const app = build()
const { SUPABASE_URL, SUPABASE_KEY } = process.env
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const users = [
    { email: 'test1@fakemail.com', password: bcrypt.hashSync('pcw', 10) },
]

beforeAll(async() => {
    await supabase.from('users_blog').delete()
    await supabase.from('users_blog').insert(users)
})
afterAll(async() => {
    await supabase.from('users_blog').delete()
    app.close()
})

describe('server is running', () => {
    test('GET / returns a 200', async() => {
        const response = await app.inject({ method: 'GET', url: '/' })
        expect(response.statusCode).toBe(200)
    })
})

describe('server is running', () => {
    test('GET /articles returns a 200', async() => {
        const response = await app.inject({ method: 'GET', url: '/' })
        expect(response.statusCode).toBe(200)
    })
})

describe('server is running', () => {
    test('GET /categories returns a 200', async() => {
        const response = await app.inject({ method: 'GET', url: '/' })
        expect(response.statusCode).toBe(200)
    })
})

describe('authentication flow', () => {
    describe('POST /signup ', () => {
        test('fails if invalid payload', async() => {
            const response1 = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: { email: 'invalidnewmail.com', password: 'pcw' },
            })
            expect(response1.statusCode).toBe(400)
            expect(response1.json()).toStrictEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: 'body.email should match format "email"',
            })

            const response2 = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: { email: 'valid@newmail.com' },
            })
            expect(response2.statusCode).toBe(400)
            expect(response2.json()).toStrictEqual({
                statusCode: 400,
                error: 'Bad Request',
                message: "body should have required property 'password'",
            })
        })

        test('registers users', async() => {
            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: { email: 'test@newmail.com', password: 'pcw' },
            })
            expect(response.statusCode).toBe(200)
            expect(response.json().id.length).toBe(36)
            expect(response.json().success).toBe(true)
        })

        test('cannot signup twice with the same email address', async() => {
            const response = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: { email: 'same@email.com', password: 'pswrd' },
            })

            expect(response.statusCode).toBe(200)

            const responseFail = await app.inject({
                method: 'POST',
                url: '/signup',
                payload: { email: 'same@email.com', password: 'pswrd' },
            })
            expect(responseFail.statusCode).toBe(400)
        })
    })

    describe('POST /signin', () => {
        test('fails if wrong email', async() => {
            const response = await app.inject({
                method: 'POST',
                url: '/signin',
                payload: { email: 'unexisting@email.com', password: 'pcw' },
            })

            expect(response.statusCode).toBe(404)
        })

        test('fails if wrong password', async() => {
            const response = await app.inject({
                method: 'POST',
                url: '/signin',
                payload: { email: users[0].email, password: 'nope' },
            })

            expect(response.statusCode).toBe(404)
        })

        test('returns JWT', async() => {
            const response = await app.inject({
                method: 'POST',
                url: '/signin',
                payload: { email: users[0].email, password: 'pcw' },
            })

            expect(response.statusCode).toBe(200)
            expect(response.json().jwt).toBeDefined()
        })
    })

    describe('GET /me', () => {
        test('returns 401 if no or invalid auth', async() => {
            const response1 = await app.inject({
                method: 'GET',
                url: '/me',
                headers: {},
            })
            expect(response1.statusCode).toBe(401)
            const response2 = await app.inject({
                method: 'GET',
                url: '/me',
                headers: { authorization: 'invalid' },
            })
            expect(response2.statusCode).toBe(401)
        })

        test('returns valid user', async() => {
            const response = await app.inject({
                method: 'POST',
                url: '/signin',
                payload: { email: users[0].email, password: 'pcw' },
            })
            expect(response.statusCode).toBe(200)
            const { jwt } = response.json()

            const responseMe = await app.inject({
                method: 'GET',
                url: '/me',
                headers: { authorization: jwt },
            })
            expect(responseMe.statusCode).toBe(200)
            const resJson = responseMe.json()
            expect(resJson.success).toBe(true)
            expect(resJson.data).toBeDefined()

            const uuidRegExp = /^[\d\w]{8}-[\d\w]{4}-[\d\w]{4}-[\d\w]{4}-[\d\w]{12}$/
            expect(uuidRegExp.test(resJson.data.id)).toBe(true)
        })
    })

    describe('POST /signup & /signin', () => {
        test('should return 401 if the user is already authenticated', async() => {
            const response = await app.inject({
                method: 'POST',
                url: '/signin',
                payload: { email: users[0].email, password: 'pcw' },
            })
            expect(response.statusCode).toBe(200)
            const { jwt } = response.json()

            const request = {
                method: 'POST',
                headers: { authorization: jwt },
                payload: { email: 'fake@fakmail.com', password: 'pcw' },
            }

            const signup = await app.inject({...request, url: '/signup' })
            const signin = await app.inject({...request, url: '/signin' })

            expect(signup.statusCode).toBe(401)
            expect(signin.statusCode).toBe(401)
        })
    })
})