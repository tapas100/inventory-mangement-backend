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
                return response.json({ "user": user, "access_token": accessToken,message:'Registered Sucessfully !' })
            }
            catch (e) {
                console.log(e);
                return response.status(422).send({ message: 'Please try again', error: e });
            }

        }
        else {
            console.log(validation.messages());
            if (validation.messages()[0].field == 'username' && validation.messages()[0].validation == 'unique') {
                return response.status(422).send({ message: 'Username already exist..!', error: validation.messages() });
            }
            if (validation.messages()[0].field == 'email') {
                if (validation.messages()[0].validation == 'unique') {
                    return response.status(422).send({ message: 'Email already exist..!', error: validation.messages() });
                }
                if (validation.messages()[0].validation == 'email') {
                    return response.status(422).send({ message: 'Please enter a valid email ..!', error: validation.messages() });
                }
            }
            return response.status(422).send({ error: 'Please try again', message: validation.messages() });
        }

    }
    async login({ request, auth, response, error }) {
        const username = request.input("username")
        const password = request.input("password");
        try {
            if (await auth.attempt(username, password)) {
                let user = await User.findBy('username', username)
                let accessToken = await auth.generate(user)
                return response.status(200).json({ "user": user, "access_token": accessToken, message: 'Logged in sucessfully !' })
            }

        }
        catch (e) {
            if (e.passwordField && e.uidField == undefined) {
                return response.status(422).json({ message: 'Oops wrong Password ! Please Try Again' })
            }
            else if (e.passwordField && e.uidField) {
                return response.status(422).json({ message: 'No User Found on this Username ! Please Try Again' })
            }
            return response.status(422).json({ message: e })
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
