'use strict'

const { validateAll } = use('Validator')

const User = use('App/Models/User')
const randonString = use('random-string')
const Mail = use('Mail')

class RegisterController {

    async register({ request , response }) {
        // validate parameter
        const validation = await validateAll(request.all(), {
            username: 'required|unique:users,username',
            email: 'required|email|unique:users,email',
            password: 'required'
        })

        if (validation.fails()) {
            return response.status(422).json(validation.messages());
        }
        // create user
        const user = User.create({
            username: request.input('username'),
            email: request.input('email'),
            password: request.input('password'),
            confirmation_token: randonString({ length: 30 })
        })
        // send confirmation mail
        await Mail.send('Auth.Emails.confirm_email', user, message => {
            message
                .to(user.email)
                .from('mahanta.tapas9@gmail.com')
                .subject('Welcome To Your Inventory Management Platform')
        })

        return response.status(201).json({ message: 'Successfully Registered ! An Email has been sent to your mail Please confirm your mail' })
    }
}

module.exports = RegisterController
