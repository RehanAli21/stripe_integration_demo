require('dotenv').config()

const express = require('express')
const app = express()

const nodemailer = require('nodemailer')

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
			success_url: `${process.env.SERVER_URL}/email.html?message=success&email=${req.body.email}&amount=${req.body.amount}`,
			cancel_url: `${process.env.SERVER_URL}/email.html?message=cancel&email=${req.body.email}&amount=${req.body.amount}`,
		})

		res.json({ url: session.url })
	} catch (err) {
		console.log(err)
		res.status(500).json({ err: err.message })
	}
})

app.post('/email', async (req, res) => {
	const emailTransporter = nodemailer.createTransport({
		host: 'smtp.mail.yahoo.com',
		port: 465,
		service: 'yahoo',
		secure: false,
		auth: {
			user: process.env.SENDEREMAIL,
			pass: process.env.SENDEREMAILPASS,
		},
		debug: false,
		logger: true,
	})

	let mailOptions = {
		from: `"Rehan's Donation" <${process.env.SENDEREMAIL}>`, // sender address
		to: `${req.body.email}`, // list of receivers
		subject: 'Donation Received', // Subject line
		text: `${req.body.amount}$ received.\nThanks for you kindness`, // plain text body
		html: `<h1>${req.body.amount}$ received.\nThanks for you kindness</h1>`, // html body
	}

	emailTransporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			return console.log(err)
		}
	})
})

app.listen(process.env.PORT || 3000, () => console.log('Server is running'))
