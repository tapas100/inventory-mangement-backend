'use strict'
const User = use('App/Models/User')
const { validate } = use('Validator');
const randomString = require('random-string')
class AuthController {
    async register({ request, auth, response }) {
        const rules = {
            email: 'required|email|unique:users,email',
            username: 'required|unique:users,username',
            password: 'required'
        };

        const { email, username, password } = request.only([
            'email',
            'username',
            'password'
        ]);

        const validation = await validate({ email, username, password }, rules);
        if (!validation.fails()) {
            try {
                let user = new User()
                user.username = username
                user.email = email
                user.password = password
                user.uid = randomString({ length: 12 })
                let accessToken = await auth.generate(user)
                user = await user.save()
                return response.json({ "user": user, "access_token": accessToken })
            }
            catch (e) {
                console.log(e);
                return response.status(401).send({ error: 'Please try again', message: e });
            }

        }
        else {
            return response.status(401).send({ error: 'Please try again', message: validation.messages() });
        }

    }
    async login({ request, auth, response }) {
        const username = request.input("username")
        const password = request.input("password");
        try {
            if (await auth.attempt(username, password)) {
                let user = await User.findBy('username', username)
                let accessToken = await auth.generate(user)
                return response.json({ "user": user, "access_token": accessToken })
            }

        }
        catch (e) {
            return response.json({ message: 'You first need to register!' })
        }
    }
    async logout({ auth, response }) {

        try {
            const user = await auth.getUser()
            const token = await auth.getAuthHeader()
            await user
                .tokens()
                .where('token', token)
                .update({ is_revoked: true })

            return response.status(200).json({ message: 'Logged out sucessfully !' })
        } catch (error) {
            response.send('Missing or invalid jwt token')
        }

    }
}

module.exports = AuthController
