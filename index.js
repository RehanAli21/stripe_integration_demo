require('dotenv').config()

const e = require('express')
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('public'))

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

app.post('/donate', async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'payment',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: { name: 'Donation' },
						unit_amount: req.body.amount * 100,
					},
					quantity: 1,
				},
			],
			success_url: `${process.env.SERVER_URL}?message=success`,
			cancel_url: `${process.env.SERVER_URL}?message=cancel`,
		})

		res.json({ url: session.url })
	} catch (err) {
		console.log(err)
		res.status(500).json({ err: err.message })
	}
})

app.listen(process.env.PORT || 3000, () => console.log('Server is running'))
