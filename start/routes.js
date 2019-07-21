'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')
Route.group('/',() =>{
    Route.post('register','AuthController.register').as('register')
    Route.post('login','AuthController.login').as('login')
    Route.get('logout','AuthController.logout').as('logout').middleware('auth')
}).prefix('api/v1/account')

Route.group('/', ()=>{
    Route.post('create','ProductController.store').as('create').middleware('auth')
    Route.put('update/:id','ProductController.update').as('update').middleware('auth')
    Route.delete('delete/:id','ProductController.delete').as('delete').middleware('auth')
    Route.get('all','ProductController.index').as('all').middleware('auth')
}).prefix('api/v1/product')