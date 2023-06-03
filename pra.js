const axios = require('axios');

const pra = async () => {
	try {
		const url = 'https://evepraisal.com/appraisal/structured.json';
		const data = {
			market_name: 'jita',
			items: [
				{
					name: `Sacrilege Biosecurity Responders SKIN	1
            Sunesis Versus Redforce SKIN	1
            Taranis Biosecurity Responders SKIN	1
            Vexor Versus Blueforce SKIN	1
            Vigil Biosecurity Responders SKIN	1`,
				},
			],
		};
		const headers = {
			'User-Agent': 'NOOKD-BOT',
			'Content-Type': 'application/json',
		};

		const response = await axios.post(url, data, { headers });
		console.log(response.data.appraisal);
	} catch (err) {
		console.error(err);
	}
};

pra();
