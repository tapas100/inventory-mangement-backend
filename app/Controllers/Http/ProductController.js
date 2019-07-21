'use strict'
const Product = use('App/Models/Product')
class ProductController {
    async index({ response }) {
        let products = await Product.all()

        return response.json(products);
    }

    async store({ request, response }) {
        const productInfo = request.only([
            'name',
            'price',
            'rating'
        ]);
        const product = this.createProduct(productInfo);
        await product.save()
        return response.status(201).json(product);
    }

    async update({ params, request, response }) {
        const productInfo = request.only([
            'name',
            'price',
            'rating'
        ]);

        let product = await Product.find(params.id)
        if (!product) {
            return response.status(404).json({ message: "Data Not Found" })
        }

        product.name = productInfo.name
        product.price = productInfo.price
        product.rating = productInfo.rating
        await product.save()
        return response.status(202).json(product);
    }

    async delete({ params, response }) {
        const product = await Product.find(params.id);
        if (!product) {
            return response.status(404).json({ message: 'Data Not found' })
        }

        product.delete()

        return response.status(200).json({ message: 'Deleted Successfully' })

    }

    createProduct(productInfo) {
            const product = new Product();
            product.name = productInfo.name
            product.price = productInfo.price
            product.rating = productInfo.rating
        return product
    }
}

module.exports = ProductController
